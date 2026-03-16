import base64
from collections import deque
import hashlib
import hmac
import io
import json
import logging
from pathlib import Path
import secrets
import string
import time
import uuid
from urllib.parse import quote, urlparse

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.cache import cache
from django.contrib.auth.password_validation import validate_password
from django.core import signing
from django.core.exceptions import ValidationError
from django.db import connection, transaction
from django.http import HttpResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from minio import Minio
from minio.error import S3Error
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import WebsiteSetting

SUCCESS_CODE = '0000'
ERROR_CODE_INVALID_PARAMS = '1001'
ERROR_CODE_AUTH_FAILED = '1002'
ERROR_CODE_FORBIDDEN = '1003'
ERROR_CODE_NOT_FOUND = '1004'


def _as_bool(value, default=False):
    if isinstance(value, bool):
        return value
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return value != 0
    normalized = str(value).strip().lower()
    if normalized in {'1', 'true', 'yes', 'y', 'on'}:
        return True
    if normalized in {'0', 'false', 'no', 'n', 'off'}:
        return False
    return default

REFRESH_TOKEN_SALT = 'api.refresh.token'
REFRESH_TOKEN_MAX_AGE = getattr(settings, 'REFRESH_TOKEN_MAX_AGE', 7 * 24 * 60 * 60)
CAPTCHA_TOKEN_SALT = 'api.captcha.token'
CAPTCHA_MAX_AGE = getattr(settings, 'CAPTCHA_MAX_AGE', 5 * 60)
CAPTCHA_SINGLE_USE = getattr(settings, 'CAPTCHA_SINGLE_USE', True)
LOGIN_MAX_FAIL_COUNT = getattr(settings, 'LOGIN_MAX_FAIL_COUNT', 5)
LOGIN_FAIL_WINDOW_SECONDS = getattr(settings, 'LOGIN_FAIL_WINDOW_SECONDS', 10 * 60)
LOGIN_LOCK_SECONDS = getattr(settings, 'LOGIN_LOCK_SECONDS', 15 * 60)
LOGIN_MAX_USERNAME_LENGTH = 150
LOGIN_MAX_PASSWORD_LENGTH = 128
LOGIN_MAX_CAPTCHA_ID_LENGTH = 1024
WEBSITE_NAME_MAX_LENGTH = 100
WATERMARK_TEXT_MAX_LENGTH = 100
WATERMARK_FONT_SIZE_MIN = 10
WATERMARK_FONT_SIZE_MAX = 36
WATERMARK_OPACITY_MIN = 0.05
WATERMARK_OPACITY_MAX = 0.5
WATERMARK_ROTATE_MIN = -90
WATERMARK_ROTATE_MAX = 90
WEBSITE_IMAGE_MAX_BYTES = getattr(settings, 'WEBSITE_IMAGE_MAX_BYTES', 2 * 1024 * 1024)
WEBSITE_IMAGE_MAX_LENGTH = WEBSITE_IMAGE_MAX_BYTES * 2
WEBSITE_IMAGE_ALLOWED_TYPES = {
    'image/avif',
    'image/bmp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/tiff',
    'image/vnd.microsoft.icon',
    'image/webp',
    'image/x-icon',
}
WEBSITE_IMAGE_EXTENSION_MAP = {
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heif',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/tiff': 'tiff',
    'image/vnd.microsoft.icon': 'ico',
    'image/webp': 'webp',
    'image/x-icon': 'ico',
}
WEBSITE_IMAGE_MIME_MAP = {
    'avif': 'image/avif',
    'bmp': 'image/bmp',
    'gif': 'image/gif',
    'heic': 'image/heic',
    'heif': 'image/heif',
    'ico': 'image/x-icon',
    'jfif': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'webp': 'image/webp',
}
WEBSITE_IMAGE_KIND_SET = {'favicon', 'logo'}
WEBSITE_ASSET_OBJECT_PREFIX = 'website-assets'
_MINIO_BUCKET_READY_CACHE_KEY = 'api:minio:bucket:ready'
WEBSITE_LOGO_AUTO_TRANSPARENT = _as_bool(getattr(settings, 'WEBSITE_LOGO_AUTO_TRANSPARENT', True), True)
WEBSITE_LOGO_TRANSPARENT_TOLERANCE = int(getattr(settings, 'WEBSITE_LOGO_TRANSPARENT_TOLERANCE', 28))
WEBSITE_LOGO_TRANSPARENT_MIN_RATIO = float(getattr(settings, 'WEBSITE_LOGO_TRANSPARENT_MIN_RATIO', 0.01))

logger = logging.getLogger(__name__)

ROLE_BUTTONS_MAP = {
    'R_SUPER': ['B_CODE1', 'B_CODE2', 'B_CODE3'],
    'R_ADMIN': ['B_CODE2', 'B_CODE3'],
    'R_USER': ['B_CODE3']
}

DATA_SCHEDULE_SCOPE_ALL = 'all'
DATA_SCHEDULE_SCOPE_COMPLETE = 'complete'
DATA_SCHEDULE_SCOPE_MISSING = 'missing'
DATA_SCHEDULE_SCOPE_SET = {
    DATA_SCHEDULE_SCOPE_ALL,
    DATA_SCHEDULE_SCOPE_COMPLETE,
    DATA_SCHEDULE_SCOPE_MISSING,
}


def _parse_positive_int(value, default=1, max_value=200):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default

    if parsed <= 0:
        return default
    if parsed > max_value:
        return max_value

    return parsed


def _build_data_schedule_mock_fields():
    fields = [
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'bid_no',
            'fieldName': '招标编号',
            'fieldValueDisplay': 'CG1201002025044003(1)',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'project_year',
            'fieldName': '项目年度',
            'fieldValueDisplay': '2025',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'bidder_name',
            'fieldName': '招标人',
            'fieldValueDisplay': '天津市城市道路桥梁管理事务中心',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'legal_person',
            'fieldName': '法定代表人',
            'fieldValueDisplay': '李民',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'project_name',
            'fieldName': '项目名称',
            'fieldValueDisplay': '道桥中心2025年度道路挖掘损害修复项目',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'approver_org',
            'fieldName': '项目批准机关',
            'fieldValueDisplay': '天津市城市管理委员会',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'approval_doc_no',
            'fieldName': '批准文号',
            'fieldValueDisplay': '津城管桥批〔2025〕33号',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'pricing_ceiling',
            'fieldName': '招标代理机构最高投标限价',
            'fieldValueDisplay': '39400000',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'authorized_letter',
            'fieldName': '授权委托书',
            'fieldValueDisplay': '--',
            'status': DATA_SCHEDULE_SCOPE_MISSING
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'insurance_proof',
            'fieldName': '参保缴费证明',
            'fieldValueDisplay': '--',
            'status': DATA_SCHEDULE_SCOPE_MISSING
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'project_bill_of_quantities',
            'fieldName': '工程量清单',
            'fieldValueDisplay': '--',
            'status': DATA_SCHEDULE_SCOPE_MISSING
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'bidder_representative',
            'fieldName': '唱标人代表',
            'fieldValueDisplay': '--',
            'status': DATA_SCHEDULE_SCOPE_MISSING
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'bid_opening_host',
            'fieldName': '唱标人',
            'fieldValueDisplay': '王文哲',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'recorder',
            'fieldName': '记录人',
            'fieldValueDisplay': '洪聪',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': True,
            'canEdit': True,
            'fieldKey': 'supervisor_info',
            'fieldName': '监督人信息',
            'fieldValueDisplay': '查看',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': True,
            'canEdit': True,
            'fieldKey': 'expert_info',
            'fieldName': '评标专家信息',
            'fieldValueDisplay': '查看',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'committee_member_list',
            'fieldName': '评标委员会组成人员名单',
            'fieldValueDisplay': '--',
            'status': DATA_SCHEDULE_SCOPE_MISSING
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'party_a_representative_name',
            'fieldName': '甲方评委代表人姓名',
            'fieldValueDisplay': '徐鹏',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'party_a_representative_id_no',
            'fieldName': '甲方评委代表人身份证号',
            'fieldValueDisplay': '120101197607132554',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'party_a_representative_mobile',
            'fieldName': '甲方评委代表人手机号',
            'fieldValueDisplay': '18622884518',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'construction_unit_name',
            'fieldName': '建设单位法人名称',
            'fieldValueDisplay': '天津市城市道路桥梁管理事务中心',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'construction_unit_legal_person',
            'fieldName': '建设单位法人代表姓名',
            'fieldValueDisplay': '李民',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'construction_unit_cert_no',
            'fieldName': '建设单位证件号',
            'fieldValueDisplay': '120108197710274037',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'qualification_review_form',
            'fieldName': '资格评审情况表',
            'fieldValueDisplay': '--',
            'status': DATA_SCHEDULE_SCOPE_MISSING
        },
        {
            'canDrilldown': True,
            'canEdit': True,
            'fieldKey': 'bid_ranking',
            'fieldName': '投标报价排名',
            'fieldValueDisplay': '查看',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': True,
            'canEdit': True,
            'fieldKey': 'winning_candidate_notice',
            'fieldName': '中标候选人公示',
            'fieldValueDisplay': '查看',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'winning_company',
            'fieldName': '中标人',
            'fieldValueDisplay': '天津路桥建设工程有限公司',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
        {
            'canDrilldown': False,
            'canEdit': True,
            'fieldKey': 'winning_amount',
            'fieldName': '中标金额',
            'fieldValueDisplay': '38296827',
            'status': DATA_SCHEDULE_SCOPE_COMPLETE
        },
    ]

    # Fillers to keep a data-dense detail table like the design reference.
    for index in range(1, 17):
        status_value = DATA_SCHEDULE_SCOPE_COMPLETE if index % 3 else DATA_SCHEDULE_SCOPE_MISSING
        fields.append(
            {
                'canDrilldown': False,
                'canEdit': True,
                'fieldKey': f'extended_field_{index}',
                'fieldName': f'扩展字段{index}',
                'fieldValueDisplay': f'扩展值{index}' if status_value == DATA_SCHEDULE_SCOPE_COMPLETE else '--',
                'status': status_value,
            }
        )

    return fields


DATA_SCHEDULE_DRILLDOWN_MOCK = {
    'expert_info': {
        'columns': [
            {'editable': True, 'key': 'expertName', 'title': '专家姓名'},
            {'editable': True, 'key': 'idNo', 'title': '证件号'},
            {'editable': True, 'key': 'major', 'title': '评标专业'},
            {'editable': True, 'key': 'expertType', 'title': '专家类型'},
            {'editable': True, 'key': 'workUnit', 'title': '工作单位'},
            {'editable': True, 'key': 'contact', 'title': '联系方式'},
        ],
        'records': [
            {'contact': '--', 'expertName': '周盈盈', 'expertType': '社会评委（正常）', 'id': 1, 'idNo': '--', 'major': '--', 'workUnit': '天津海泰市政绿化有限公司'},
            {'contact': '--', 'expertName': '莫鸿雁', 'expertType': '社会评委（正常）', 'id': 2, 'idNo': '--', 'major': '--', 'workUnit': '天津市蓟州区水务管理服务中心'},
            {'contact': '--', 'expertName': '高国妍', 'expertType': '社会评委（正常）', 'id': 3, 'idNo': '--', 'major': '--', 'workUnit': '天津市西青区公路建设养护中心'},
            {'contact': '--', 'expertName': '李晓明', 'expertType': '社会评委（正常）', 'id': 4, 'idNo': '--', 'major': '--', 'workUnit': '天津安纳赛能源科技有限公司'},
            {'contact': '--', 'expertName': '郭听燃', 'expertType': '招标人代表', 'id': 5, 'idNo': '120101198607303012', 'major': '--', 'workUnit': '天津市城市道路桥梁管理事务中心'},
            {'contact': '--', 'expertName': '徐鹏', 'expertType': '招标人代表', 'id': 6, 'idNo': '120101197607132554', 'major': '--', 'workUnit': '天津市城市道路桥梁管理事务中心'},
            {'contact': '--', 'expertName': '刘斌', 'expertType': '招标人代表', 'id': 7, 'idNo': '--', 'major': '--', 'workUnit': '天津市城市道路桥梁管理事务中心'},
            {'contact': '--', 'expertName': '李志壮', 'expertType': '社会评委（正常）', 'id': 8, 'idNo': '--', 'major': '--', 'workUnit': '天津市建设发展总公司'},
            {'contact': '--', 'expertName': '白树海', 'expertType': '社会评委（正常）', 'id': 9, 'idNo': '--', 'major': '--', 'workUnit': '天津市市政景观设计有限公司'},
        ],
        'title': '字段详情 - 评标专家信息'
    },
    'supervisor_info': {
        'columns': [
            {'editable': True, 'key': 'name', 'title': '监督人姓名'},
            {'editable': True, 'key': 'department', 'title': '所属单位'},
            {'editable': True, 'key': 'duty', 'title': '职务'},
            {'editable': True, 'key': 'contact', 'title': '联系方式'},
        ],
        'records': [
            {'contact': '13800001234', 'department': '天津市城市管理委员会', 'duty': '项目监督员', 'id': 1, 'name': '张晨'},
            {'contact': '13900004321', 'department': '天津市城市管理委员会', 'duty': '质量监督员', 'id': 2, 'name': '刘洋'},
        ],
        'title': '字段详情 - 监督人信息'
    },
    'bid_ranking': {
        'columns': [
            {'editable': True, 'key': 'companyName', 'title': '投标单位'},
            {'editable': True, 'key': 'bidAmount', 'title': '投标报价'},
            {'editable': True, 'key': 'rank', 'title': '排名'},
            {'editable': True, 'key': 'remark', 'title': '备注'},
        ],
        'records': [
            {'bidAmount': '38296827', 'companyName': '天津路桥建设工程有限公司', 'id': 1, 'rank': '1', 'remark': '中标候选人'},
            {'bidAmount': '38900220', 'companyName': '天津市政工程集团', 'id': 2, 'rank': '2', 'remark': '--'},
            {'bidAmount': '39218800', 'companyName': '天津城建路桥有限公司', 'id': 3, 'rank': '3', 'remark': '--'},
        ],
        'title': '字段详情 - 投标报价排名'
    },
    'winning_candidate_notice': {
        'columns': [
            {'editable': True, 'key': 'candidateName', 'title': '候选人名称'},
            {'editable': True, 'key': 'publicDate', 'title': '公示日期'},
            {'editable': True, 'key': 'score', 'title': '综合得分'},
            {'editable': True, 'key': 'remark', 'title': '备注'},
        ],
        'records': [
            {'candidateName': '天津路桥建设工程有限公司', 'id': 1, 'publicDate': '2026-02-05', 'remark': '第一中标候选人', 'score': '97.50'},
            {'candidateName': '天津市政工程集团', 'id': 2, 'publicDate': '2026-02-05', 'remark': '第二中标候选人', 'score': '95.20'},
            {'candidateName': '天津城建路桥有限公司', 'id': 3, 'publicDate': '2026-02-05', 'remark': '第三中标候选人', 'score': '93.40'},
        ],
        'title': '字段详情 - 中标候选人公示'
    }
}


def _get_data_schedule_summary(task_id):
    return {
        'bidNo': 'CG1201002025044003(1)',
        'createTime': '2026-02-04 15:51:30',
        'creator': '管理员',
        'progress': 100,
        'projectName': '道桥中心2025年度道路挖掘损害修复项目',
        'status': 'success',
        'taskId': task_id,
    }


def _get_data_schedule_fields(task_id):
    # task_id is kept for future real data-source replacement.
    _ = task_id
    return _build_data_schedule_mock_fields()


def _filter_data_schedule_fields_by_scope(fields, scope):
    if scope == DATA_SCHEDULE_SCOPE_COMPLETE:
        return [item for item in fields if item.get('status') == DATA_SCHEDULE_SCOPE_COMPLETE]
    if scope == DATA_SCHEDULE_SCOPE_MISSING:
        return [item for item in fields if item.get('status') == DATA_SCHEDULE_SCOPE_MISSING]
    return fields


def _build_data_schedule_counts(fields):
    complete = len([item for item in fields if item.get('status') == DATA_SCHEDULE_SCOPE_COMPLETE])
    missing = len([item for item in fields if item.get('status') == DATA_SCHEDULE_SCOPE_MISSING])
    return {'all': len(fields), 'complete': complete, 'missing': missing}


def _safe_excel_sheet_name(raw_name, used_names):
    invalid_chars = ['\\', '/', '*', '?', ':', '[', ']']
    safe = raw_name
    for char in invalid_chars:
        safe = safe.replace(char, '_')
    safe = (safe or 'sheet').strip()
    safe = safe[:31]
    if not safe:
        safe = 'sheet'

    candidate = safe
    suffix = 1
    while candidate in used_names:
        suffix_text = f'_{suffix}'
        candidate = f'{safe[:31 - len(suffix_text)]}{suffix_text}'
        suffix += 1

    used_names.add(candidate)
    return candidate


def _normalize_data_schedule_scope(raw_scope):
    scope = str(raw_scope or DATA_SCHEDULE_SCOPE_ALL).strip().lower()
    if not scope:
        scope = DATA_SCHEDULE_SCOPE_ALL
    if scope not in DATA_SCHEDULE_SCOPE_SET:
        return None
    return scope


def _to_data_schedule_field_record(field):
    return {
        'canDrilldown': bool(field.get('canDrilldown')),
        'canEdit': bool(field.get('canEdit')),
        'drilldownLabel': '查看' if field.get('canDrilldown') else '',
        'fieldKey': field.get('fieldKey') or '',
        'fieldName': field.get('fieldName') or '',
        'fieldValueDisplay': field.get('fieldValueDisplay') or '--',
        'status': field.get('status') or DATA_SCHEDULE_SCOPE_MISSING
    }


def _paginate_data_schedule_records(records, current, size):
    total = len(records)
    start = (current - 1) * size
    end = start + size
    return {
        'current': current,
        'records': records[start:end],
        'size': size,
        'total': total
    }


def _build_data_schedule_export_binary(task_id, scope):
    try:
        from openpyxl import Workbook
    except Exception as exc:
        logger.exception('openpyxl import failed: %s', exc)
        raise

    all_fields = _get_data_schedule_fields(task_id)
    filtered_fields = _filter_data_schedule_fields_by_scope(all_fields, scope)
    summary = _get_data_schedule_summary(task_id)
    counts = _build_data_schedule_counts(all_fields)
    summary['counts'] = counts

    workbook = Workbook()
    used_sheet_names = set()
    summary_sheet = workbook.active
    summary_sheet.title = _safe_excel_sheet_name('任务概览', used_sheet_names)
    summary_sheet.append(['字段', '内容'])
    summary_rows = [
        ('任务标识', summary.get('taskId') or ''),
        ('项目名称', summary.get('projectName') or ''),
        ('招标编号', summary.get('bidNo') or ''),
        ('创建人', summary.get('creator') or ''),
        ('创建时间', summary.get('createTime') or ''),
        ('执行状态', summary.get('status') or ''),
        ('执行进度', f"{summary.get('progress') or 0}%"),
        ('全部字段', counts.get('all') or 0),
        ('提取完整', counts.get('complete') or 0),
        ('提取缺失', counts.get('missing') or 0),
    ]
    for row in summary_rows:
        summary_sheet.append(list(row))

    field_sheet = workbook.create_sheet(_safe_excel_sheet_name(f'字段详情_{scope}', used_sheet_names))
    field_sheet.append(['字段名称', '字段内容', '状态', '操作'])

    drilldown_sheet_map = {}
    for field in filtered_fields:
        if not field.get('canDrilldown'):
            continue
        field_key = field.get('fieldKey') or ''
        if field_key not in DATA_SCHEDULE_DRILLDOWN_MOCK:
            continue
        sheet_name = _safe_excel_sheet_name(f"下钻_{field.get('fieldName') or field_key}", used_sheet_names)
        drilldown_sheet_map[field_key] = sheet_name
        drilldown_sheet = workbook.create_sheet(sheet_name)
        drilldown_payload = DATA_SCHEDULE_DRILLDOWN_MOCK[field_key]
        columns = drilldown_payload.get('columns') or []
        drilldown_sheet.append([col.get('title') or col.get('key') or '' for col in columns] + ['操作'])
        for row in drilldown_payload.get('records') or []:
            row_values = [row.get(col.get('key') or '', '--') for col in columns]
            row_values.append('编辑 / 删除')
            drilldown_sheet.append(row_values)
        drilldown_sheet.freeze_panes = 'A2'

    for index, field in enumerate(filtered_fields, start=2):
        status_value = field.get('status')
        if status_value == DATA_SCHEDULE_SCOPE_COMPLETE:
            status_text = '提取完整'
        elif status_value == DATA_SCHEDULE_SCOPE_MISSING:
            status_text = '提取缺失'
        else:
            status_text = status_value or ''

        field_sheet.append([
            field.get('fieldName') or '',
            field.get('fieldValueDisplay') or '--',
            status_text,
            '编辑'
        ])

        field_key = field.get('fieldKey') or ''
        if field_key in drilldown_sheet_map:
            value_cell = field_sheet.cell(row=index, column=2)
            value_cell.value = '查看'
            value_cell.hyperlink = f"#{drilldown_sheet_map[field_key]}!A1"
            value_cell.style = 'Hyperlink'

    field_sheet.freeze_panes = 'A2'

    output = io.BytesIO()
    workbook.save(output)
    workbook.close()
    output.seek(0)
    return output.getvalue()


def success_response(data=None, msg='ok', http_status=status.HTTP_200_OK):
    return Response({'code': SUCCESS_CODE, 'data': data, 'msg': msg}, status=http_status)


def error_response(msg, code=ERROR_CODE_INVALID_PARAMS, http_status=status.HTTP_400_BAD_REQUEST):
    return Response({'code': code, 'data': None, 'msg': msg}, status=http_status)

_WATERMARK_HIDDEN_MODE_COLUMN_EXISTS = None


def _supports_watermark_hidden_mode():
    global _WATERMARK_HIDDEN_MODE_COLUMN_EXISTS

    if _WATERMARK_HIDDEN_MODE_COLUMN_EXISTS is not None:
        return _WATERMARK_HIDDEN_MODE_COLUMN_EXISTS

    try:
        with connection.cursor() as cursor:
            columns = connection.introspection.get_table_description(cursor, WebsiteSetting._meta.db_table)
        _WATERMARK_HIDDEN_MODE_COLUMN_EXISTS = any(
            getattr(column, 'name', '') == 'watermark_hidden_mode'
            for column in columns
        )
    except Exception as exc:
        logger.warning('detect watermark_hidden_mode column failed, fallback to disabled: %s', exc)
        _WATERMARK_HIDDEN_MODE_COLUMN_EXISTS = False

    return _WATERMARK_HIDDEN_MODE_COLUMN_EXISTS


def _clean_username(raw_username):
    return (raw_username or '').strip()


def _create_refresh_token(user):
    payload = {
        'passwordFingerprint': hashlib.sha256(user.password.encode('utf-8')).hexdigest(),
        'uid': user.id,
        'username': user.username
    }
    return signing.dumps(payload, salt=REFRESH_TOKEN_SALT)


def _parse_refresh_token(refresh_token):
    return signing.loads(refresh_token, max_age=REFRESH_TOKEN_MAX_AGE, salt=REFRESH_TOKEN_SALT)


def _issue_auth_tokens(user):
    # Rotate the access token on each issue to avoid long-lived leaked tokens.
    Token.objects.filter(user=user).delete()
    token = Token.objects.create(user=user)

    return {'refreshToken': _create_refresh_token(user), 'token': token.key}


def _generate_captcha_code():
    return ''.join(secrets.choice(string.digits) for _ in range(4))


def _create_captcha_id(code):
    nonce_chars = string.ascii_letters + string.digits
    nonce = ''.join(secrets.choice(nonce_chars) for _ in range(16))
    digest = hashlib.sha256(f'{code}:{nonce}:{settings.SECRET_KEY}'.encode('utf-8')).hexdigest()

    captcha_id = signing.dumps({'nonce': nonce, 'digest': digest}, salt=CAPTCHA_TOKEN_SALT)
    if CAPTCHA_SINGLE_USE:
        cache.set(_captcha_cache_key(nonce), 1, timeout=CAPTCHA_MAX_AGE)

    return captcha_id


def _captcha_cache_key(nonce):
    nonce_hash = hashlib.sha256(str(nonce).encode('utf-8')).hexdigest()
    return f'api:captcha:nonce:{nonce_hash}'


def _verify_captcha(captcha_id, captcha_code):
    if not captcha_id or not captcha_code:
        return False, '验证码不能为空'

    if len(captcha_code) != 4 or not captcha_code.isdigit():
        return False, '验证码格式错误'

    try:
        payload = signing.loads(captcha_id, max_age=CAPTCHA_MAX_AGE, salt=CAPTCHA_TOKEN_SALT)
    except signing.BadSignature:
        return False, '验证码无效或已过期'

    nonce = payload.get('nonce') or ''
    digest = payload.get('digest') or ''

    if CAPTCHA_SINGLE_USE:
        captcha_key = _captcha_cache_key(nonce)
        if not cache.get(captcha_key):
            return False, '验证码无效或已过期'
        # Consume captcha before verification to prevent brute-force and replay attacks.
        cache.delete(captcha_key)

    expected_digest = hashlib.sha256(f'{captcha_code}:{nonce}:{settings.SECRET_KEY}'.encode('utf-8')).hexdigest()
    if not hmac.compare_digest(str(digest), expected_digest):
        return False, '验证码错误'

    return True, ''


def _build_captcha_svg(code):
    width = 120
    height = 40

    lines = []
    for _ in range(5):
        x1, y1 = secrets.randbelow(width + 1), secrets.randbelow(height + 1)
        x2, y2 = secrets.randbelow(width + 1), secrets.randbelow(height + 1)
        lines.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#c7d2fe" stroke-width="1" />'
        )

    texts = []
    for i, char in enumerate(code):
        x = 18 + i * 24 + (secrets.randbelow(5) - 2)
        y = 28 + (secrets.randbelow(5) - 2)
        rotate = secrets.randbelow(31) - 15
        colors = ['#1e3a8a', '#1d4ed8', '#334155', '#0f172a']
        color = colors[secrets.randbelow(len(colors))]
        texts.append(
            f'<text x="{x}" y="{y}" fill="{color}" font-size="22" '
            f'font-family="Arial, sans-serif" transform="rotate({rotate} {x} {y})">{char}</text>'
        )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">'
        '<rect width="100%" height="100%" rx="6" ry="6" fill="#f8fafc" stroke="#cbd5e1" />'
        f'{"".join(lines)}{"".join(texts)}'
        '</svg>'
    )
    encoded = base64.b64encode(svg.encode('utf-8')).decode('utf-8')

    return f'data:image/svg+xml;base64,{encoded}'


def _build_user_info(user):
    if user.is_superuser:
        role = 'R_SUPER'
    elif user.is_staff:
        role = 'R_ADMIN'
    else:
        role = 'R_USER'

    return {
        'buttons': ROLE_BUTTONS_MAP.get(role, []),
        'roles': [role],
        'userId': str(user.id),
        'userName': user.username
    }


def _extract_auth_token(request):
    auth_header = (request.headers.get('Authorization') or '').strip()
    if not auth_header:
        return ''

    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() in {'bearer', 'token'}:
        return parts[1]

    return ''


def _extract_client_ip(request):
    forwarded_for = (request.META.get('HTTP_X_FORWARDED_FOR') or '').split(',')
    if forwarded_for and forwarded_for[0].strip():
        return forwarded_for[0].strip()
    return (request.META.get('REMOTE_ADDR') or '').strip() or 'unknown'


def _build_login_subject(username, client_ip):
    raw = f'{(username or "").lower()}|{client_ip}'
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def _login_fail_key(subject):
    return f'api:login:fail:{subject}'


def _login_lock_key(subject):
    return f'api:login:lock:{subject}'


def _get_login_lock_remaining(subject):
    lock_until = cache.get(_login_lock_key(subject))
    if not lock_until:
        return 0
    try:
        remaining = int(lock_until) - int(time.time())
    except (TypeError, ValueError):
        cache.delete(_login_lock_key(subject))
        return 0

    if remaining <= 0:
        cache.delete(_login_lock_key(subject))
        return 0

    return remaining


def _register_login_failure(subject):
    fail_key = _login_fail_key(subject)
    failures = int(cache.get(fail_key) or 0) + 1
    cache.set(fail_key, failures, timeout=LOGIN_FAIL_WINDOW_SECONDS)

    if failures >= LOGIN_MAX_FAIL_COUNT:
        lock_until = int(time.time()) + int(LOGIN_LOCK_SECONDS)
        cache.set(_login_lock_key(subject), lock_until, timeout=LOGIN_LOCK_SECONDS)
        cache.delete(fail_key)
        return LOGIN_LOCK_SECONDS

    return 0


def _clear_login_failure_state(subject):
    cache.delete(_login_fail_key(subject))
    cache.delete(_login_lock_key(subject))


def _validate_login_payload(username, password, captcha_id):
    if not username or not password:
        return '用户名和密码不能为空', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST

    if len(username) > LOGIN_MAX_USERNAME_LENGTH:
        return '账号长度超出限制', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST

    if len(password) > LOGIN_MAX_PASSWORD_LENGTH:
        return '密码长度超出限制', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST

    if len(captcha_id) > LOGIN_MAX_CAPTCHA_ID_LENGTH:
        return '验证码无效或已过期', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST

    return None


def _is_minio_enabled():
    return bool(getattr(settings, 'MINIO_ENABLED', False))


def _get_minio_client():
    return Minio(
        getattr(settings, 'MINIO_ENDPOINT', ''),
        access_key=getattr(settings, 'MINIO_ACCESS_KEY', ''),
        secret_key=getattr(settings, 'MINIO_SECRET_KEY', ''),
        secure=bool(getattr(settings, 'MINIO_SECURE', False))
    )


def _ensure_minio_bucket(client):
    bucket = getattr(settings, 'MINIO_BUCKET', '')
    if not bucket:
        raise ValueError('MINIO_BUCKET is empty')

    if cache.get(_MINIO_BUCKET_READY_CACHE_KEY):
        return

    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)

    bucket_policy = {
        'Version': '2012-10-17',
        'Statement': [{
            'Effect': 'Allow',
            'Principal': {'AWS': ['*']},
            'Action': ['s3:GetObject'],
            'Resource': [f'arn:aws:s3:::{bucket}/*']
        }]
    }
    client.set_bucket_policy(bucket, json.dumps(bucket_policy))
    cache.set(_MINIO_BUCKET_READY_CACHE_KEY, 1, timeout=24 * 60 * 60)


def _minio_object_url(object_name):
    bucket = getattr(settings, 'MINIO_BUCKET', '')
    public_base_url = (getattr(settings, 'MINIO_PUBLIC_BASE_URL', '') or '').rstrip('/')
    if public_base_url:
        return f'{public_base_url}/{bucket}/{object_name}'

    scheme = 'https' if getattr(settings, 'MINIO_SECURE', False) else 'http'
    endpoint = (getattr(settings, 'MINIO_ENDPOINT', '') or '').rstrip('/')
    return f'{scheme}://{endpoint}/{bucket}/{object_name}'


def _guess_image_extension(content_type, filename=''):
    normalized_type = (content_type or '').lower()
    extension = WEBSITE_IMAGE_EXTENSION_MAP.get(normalized_type, '')
    if extension:
        return extension

    suffix = Path(filename or '').suffix.lower().lstrip('.')
    if suffix == 'jfif':
        return 'jpg'
    if suffix == 'jpeg':
        return 'jpg'
    if suffix in {'avif', 'bmp', 'gif', 'heic', 'heif', 'ico', 'jpg', 'png', 'svg', 'tif', 'tiff', 'webp'}:
        return suffix

    return ''


def _calculate_rgb_distance(color1, color2):
    return (
        abs(int(color1[0]) - int(color2[0]))
        + abs(int(color1[1]) - int(color2[1]))
        + abs(int(color1[2]) - int(color2[2]))
    )


def _estimate_background_rgb(image):
    width, height = image.size
    if width <= 0 or height <= 0:
        return 255, 255, 255

    step = max(min(width, height) // 120, 1)
    border_samples = []
    for x in range(0, width, step):
        border_samples.append(image.getpixel((x, 0)))
        border_samples.append(image.getpixel((x, height - 1)))
    for y in range(0, height, step):
        border_samples.append(image.getpixel((0, y)))
        border_samples.append(image.getpixel((width - 1, y)))

    if not border_samples:
        border_samples = [
            image.getpixel((0, 0)),
            image.getpixel((max(width - 1, 0), 0)),
            image.getpixel((0, max(height - 1, 0))),
            image.getpixel((max(width - 1, 0), max(height - 1, 0)))
        ]

    return (
        sum(int(pixel[0]) for pixel in border_samples) // len(border_samples),
        sum(int(pixel[1]) for pixel in border_samples) // len(border_samples),
        sum(int(pixel[2]) for pixel in border_samples) // len(border_samples)
    )


def _is_background_dominant_on_border(image, background_rgb, tolerance):
    width, height = image.size
    if width <= 0 or height <= 0:
        return False

    step = max(min(width, height) // 120, 1)
    border_points = []
    for x in range(0, width, step):
        border_points.append((x, 0))
        border_points.append((x, height - 1))
    for y in range(0, height, step):
        border_points.append((0, y))
        border_points.append((width - 1, y))

    if not border_points:
        return False

    matched = 0
    for x, y in border_points:
        pixel = image.getpixel((x, y))
        if _calculate_rgb_distance(pixel, background_rgb) <= tolerance:
            matched += 1

    return (matched / len(border_points)) >= 0.55


def _build_edge_seed_points(width, height, step):
    seeds = []
    for x in range(0, width, step):
        seeds.append((x, 0))
        seeds.append((x, height - 1))
    for y in range(0, height, step):
        seeds.append((0, y))
        seeds.append((width - 1, y))
    return seeds


def _transparentize_connected_background(image, background_rgb, tolerance):
    width, height = image.size
    if width <= 0 or height <= 0:
        return 0

    step = max(min(width, height) // 120, 1)
    seeds = _build_edge_seed_points(width, height, step)
    visited = set()
    queue = deque()

    for x, y in seeds:
        if (x, y) in visited:
            continue
        visited.add((x, y))
        red, green, blue, alpha = image.getpixel((x, y))
        if alpha >= 240 and _calculate_rgb_distance((red, green, blue), background_rgb) <= tolerance:
            queue.append((x, y))

    changed_pixels = 0
    while queue:
        x, y = queue.popleft()
        red, green, blue, alpha = image.getpixel((x, y))
        if alpha != 0:
            image.putpixel((x, y), (red, green, blue, 0))
            changed_pixels += 1

        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if nx < 0 or ny < 0 or nx >= width or ny >= height or (nx, ny) in visited:
                continue
            visited.add((nx, ny))
            nr, ng, nb, na = image.getpixel((nx, ny))
            if na >= 240 and _calculate_rgb_distance((nr, ng, nb), background_rgb) <= tolerance:
                queue.append((nx, ny))

    return changed_pixels


def _try_make_logo_background_transparent(binary, normalized_type, image_kind):
    if image_kind != 'logo' or not WEBSITE_LOGO_AUTO_TRANSPARENT:
        return binary, normalized_type, ''

    if normalized_type not in {
        'image/avif',
        'image/bmp',
        'image/gif',
        'image/heic',
        'image/heif',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'image/webp'
    }:
        return binary, normalized_type, ''

    try:
        from PIL import Image
    except Exception as exc:
        logger.warning('pillow is not available, skip logo transparent processing: %s', exc)
        return binary, normalized_type, ''

    try:
        with Image.open(io.BytesIO(binary)) as raw_image:
            image = raw_image.convert('RGBA')
    except Exception as exc:
        logger.warning('logo transparent processing skipped, invalid image: %s', exc)
        return binary, normalized_type, ''

    background_rgb = _estimate_background_rgb(image)
    tolerance = max(min(WEBSITE_LOGO_TRANSPARENT_TOLERANCE, 120), 0)

    pixels = list(image.getdata())
    if not pixels:
        return binary, normalized_type, ''

    candidate_backgrounds = [(255, 255, 255), (250, 250, 250)]
    if _is_background_dominant_on_border(image, background_rgb, tolerance * 3):
        candidate_backgrounds.insert(0, background_rgb)

    unique_candidates = []
    seen_candidates = set()
    for color in candidate_backgrounds:
        if color in seen_candidates:
            continue
        seen_candidates.add(color)
        unique_candidates.append(color)

    best_image = image
    best_changed_pixels = 0
    best_background = None
    for bg_color in unique_candidates:
        candidate_image = image.copy()
        changed_pixels = _transparentize_connected_background(candidate_image, bg_color, tolerance * 3)
        if changed_pixels > best_changed_pixels:
            best_changed_pixels = changed_pixels
            best_image = candidate_image
            best_background = bg_color

    changed_ratio = best_changed_pixels / len(pixels)
    if changed_ratio < WEBSITE_LOGO_TRANSPARENT_MIN_RATIO:
        return binary, normalized_type, ''

    image = best_image
    output = io.BytesIO()
    image.save(output, format='PNG', optimize=True)
    processed_binary = output.getvalue()
    if not processed_binary:
        return binary, normalized_type, ''

    if len(processed_binary) > WEBSITE_IMAGE_MAX_BYTES:
        logger.warning('transparent logo exceeds max size after processing, keep original')
        return binary, normalized_type, ''

    logger.info(
        'logo transparent processing applied, bg=%s, ratio=%.4f, bytes_before=%s, bytes_after=%s',
        best_background,
        changed_ratio,
        len(binary),
        len(processed_binary)
    )
    return processed_binary, 'image/png', 'png'


def _guess_image_content_type(content_type, filename=''):
    normalized_type = (content_type or '').lower()
    if normalized_type in WEBSITE_IMAGE_ALLOWED_TYPES:
        return normalized_type

    suffix = Path(filename or '').suffix.lower().lstrip('.')
    if suffix == 'jpeg':
        suffix = 'jpg'

    return WEBSITE_IMAGE_MIME_MAP.get(suffix, '')


def _upload_binary_to_minio(binary, content_type, image_kind, filename=''):
    if image_kind not in WEBSITE_IMAGE_KIND_SET:
        return '', '图片类型不支持'

    if not _is_minio_enabled():
        return '', '对象存储未启用，无法上传网站图片'

    normalized_type = _guess_image_content_type(content_type, filename)
    if normalized_type not in WEBSITE_IMAGE_ALLOWED_TYPES:
        return '', '网站图片格式不正确，仅支持常见图片格式'

    if len(binary) > WEBSITE_IMAGE_MAX_BYTES:
        max_mb = WEBSITE_IMAGE_MAX_BYTES // (1024 * 1024)
        return '', f'网站图片不能超过{max_mb}MB'

    processed_binary, processed_type, processed_extension = _try_make_logo_background_transparent(
        binary,
        normalized_type,
        image_kind
    )
    binary = processed_binary
    normalized_type = processed_type

    extension = processed_extension or _guess_image_extension(normalized_type, filename)
    if not extension:
        return '', '网站图片格式不正确，仅支持常见图片格式'

    try:
        client = _get_minio_client()
        _ensure_minio_bucket(client)

        object_name = f'{WEBSITE_ASSET_OBJECT_PREFIX}/{image_kind}/{uuid.uuid4().hex}.{extension}'
        client.put_object(
            bucket_name=getattr(settings, 'MINIO_BUCKET', ''),
            object_name=object_name,
            data=io.BytesIO(binary),
            length=len(binary),
            content_type=normalized_type
        )
        return _minio_object_url(object_name), ''
    except (S3Error, ValueError, Exception) as exc:
        logger.exception('website image upload to minio failed, kind=%s, error=%s', image_kind, exc)
        return '', '网站图片上传失败，请稍后重试'


def _is_admin_user(user):
    return bool(user and (user.is_staff or user.is_superuser))


def _website_settings_to_dict(settings_obj):
    return {
        'favicon': settings_obj.favicon,
        'logo': settings_obj.logo,
        'watermark': _watermark_settings_to_dict(settings_obj),
        'websiteName': settings_obj.website_name
    }


def _website_brand_settings_to_dict(settings_obj):
    return {
        'favicon': settings_obj.favicon,
        'logo': settings_obj.logo,
        'websiteName': settings_obj.website_name
    }


def _watermark_settings_to_dict(settings_obj):
    hidden_mode = bool(getattr(settings_obj, 'watermark_hidden_mode', False))
    if not _supports_watermark_hidden_mode():
        hidden_mode = False

    return {
        'enabled': settings_obj.watermark_enabled,
        'fontSize': settings_obj.watermark_font_size,
        'hiddenMode': hidden_mode,
        'opacity': settings_obj.watermark_opacity,
        'rotate': settings_obj.watermark_rotate,
        'text': settings_obj.watermark_text
    }


def _get_website_settings():
    defaults = {
        'favicon': '',
        'logo': '',
        'watermark_enabled': False,
        'watermark_font_size': 16,
        'watermark_opacity': 0.15,
        'watermark_rotate': -15,
        'watermark_text': 'zznode',
        'website_name': '智能审计系统'
    }
    if _supports_watermark_hidden_mode():
        defaults['watermark_hidden_mode'] = False

    settings_obj, _ = WebsiteSetting.objects.get_or_create(id=1, defaults=defaults)
    return settings_obj


def _get_website_settings_for_update():
    settings_obj = WebsiteSetting.objects.select_for_update().filter(id=1).first()
    if settings_obj:
        return settings_obj

    settings_obj = _get_website_settings()
    return WebsiteSetting.objects.select_for_update().get(id=settings_obj.id)


def _extract_minio_object_name(url):
    if not url:
        return ''

    parsed = urlparse(url)
    if parsed.scheme not in {'http', 'https'}:
        return ''

    allowed_netlocs = set()
    endpoint = (getattr(settings, 'MINIO_ENDPOINT', '') or '').strip()
    if endpoint:
        allowed_netlocs.add(endpoint)

    public_base_url = (getattr(settings, 'MINIO_PUBLIC_BASE_URL', '') or '').strip()
    if public_base_url:
        public_netloc = urlparse(public_base_url).netloc
        if public_netloc:
            allowed_netlocs.add(public_netloc)

    if allowed_netlocs and parsed.netloc not in allowed_netlocs:
        return ''

    bucket = (getattr(settings, 'MINIO_BUCKET', '') or '').strip()
    if not bucket:
        return ''

    expected_prefix = f'{bucket}/'
    object_path = (parsed.path or '').lstrip('/')
    if not object_path.startswith(expected_prefix):
        return ''

    object_name = object_path[len(expected_prefix):].strip()
    if not object_name.startswith(f'{WEBSITE_ASSET_OBJECT_PREFIX}/'):
        return ''

    return object_name


def _delete_minio_object(object_name):
    if not object_name or not _is_minio_enabled():
        return

    try:
        client = _get_minio_client()
        client.remove_object(getattr(settings, 'MINIO_BUCKET', ''), object_name)
    except (S3Error, ValueError, Exception) as exc:
        logger.warning('minio object cleanup failed, object=%s, error=%s', object_name, exc)


def _cleanup_stale_website_assets(previous_logo, previous_favicon, next_logo, next_favicon):
    stale_urls = []
    next_refs = {next_logo, next_favicon}

    if previous_logo and previous_logo not in next_refs:
        stale_urls.append(previous_logo)
    if previous_favicon and previous_favicon not in next_refs:
        stale_urls.append(previous_favicon)

    for stale_url in stale_urls:
        object_name = _extract_minio_object_name(stale_url)
        if object_name:
            _delete_minio_object(object_name)


def _is_valid_image_reference(value):
    if not value:
        return True

    if len(value) > WEBSITE_IMAGE_MAX_LENGTH:
        return False

    parsed = urlparse(value)
    return parsed.scheme in {'http', 'https'} and bool(parsed.netloc)


def _validate_website_brand_payload(data):
    website_name = (data.get('websiteName') or '').strip()
    logo = (data.get('logo') or '').strip()
    favicon = (data.get('favicon') or '').strip()

    if not website_name:
        return None, '网站名称不能为空'

    if len(website_name) > WEBSITE_NAME_MAX_LENGTH:
        return None, f'网站名称长度不能超过{WEBSITE_NAME_MAX_LENGTH}个字符'

    if any(ord(char) < 32 for char in website_name):
        return None, '网站名称包含非法字符'

    if not _is_valid_image_reference(logo):
        return None, '网站 Logo 格式不正确'

    if not _is_valid_image_reference(favicon):
        return None, '网站图标格式不正确'

    return {
        'favicon': favicon,
        'logo': logo,
        'website_name': website_name
    }, ''


def _validate_watermark_payload(watermark):
    if watermark is None:
        watermark = {}
    if not isinstance(watermark, dict):
        return None, '水印配置格式不正确'

    watermark_enabled = watermark.get('enabled', False)
    watermark_hidden_mode = watermark.get('hiddenMode', False)
    watermark_text = (watermark.get('text') or '').strip()
    watermark_font_size = watermark.get('fontSize', 16)
    watermark_opacity = watermark.get('opacity', 0.15)
    watermark_rotate = watermark.get('rotate', -15)

    if not isinstance(watermark_enabled, bool):
        return None, '水印开关格式不正确'

    if not isinstance(watermark_hidden_mode, bool):
        return None, '隐藏水印模式格式不正确'

    if not watermark_text:
        return None, '水印文字不能为空'
    if len(watermark_text) > WATERMARK_TEXT_MAX_LENGTH:
        return None, f'水印文字长度不能超过{WATERMARK_TEXT_MAX_LENGTH}个字符'
    if any(ord(char) < 32 for char in watermark_text):
        return None, '水印文字包含非法字符'

    try:
        watermark_font_size = int(watermark_font_size)
    except (TypeError, ValueError):
        return None, '水印字体大小格式不正确'
    if watermark_font_size < WATERMARK_FONT_SIZE_MIN or watermark_font_size > WATERMARK_FONT_SIZE_MAX:
        return None, f'水印字体大小必须在{WATERMARK_FONT_SIZE_MIN}-{WATERMARK_FONT_SIZE_MAX}之间'

    try:
        watermark_opacity = float(watermark_opacity)
    except (TypeError, ValueError):
        return None, '水印透明度格式不正确'
    if watermark_opacity < WATERMARK_OPACITY_MIN or watermark_opacity > WATERMARK_OPACITY_MAX:
        return None, f'水印透明度必须在{WATERMARK_OPACITY_MIN}-{WATERMARK_OPACITY_MAX}之间'

    try:
        watermark_rotate = int(watermark_rotate)
    except (TypeError, ValueError):
        return None, '水印旋转角度格式不正确'
    if watermark_rotate < WATERMARK_ROTATE_MIN or watermark_rotate > WATERMARK_ROTATE_MAX:
        return None, f'水印旋转角度必须在{WATERMARK_ROTATE_MIN}-{WATERMARK_ROTATE_MAX}之间'

    return {
        'watermark_enabled': watermark_enabled,
        'watermark_font_size': watermark_font_size,
        'watermark_hidden_mode': watermark_hidden_mode if _supports_watermark_hidden_mode() else False,
        'watermark_opacity': watermark_opacity,
        'watermark_rotate': watermark_rotate,
        'watermark_text': watermark_text
    }, ''


def _validate_website_settings_payload(data):
    brand_payload, brand_err_msg = _validate_website_brand_payload(data)
    if not brand_payload:
        return None, brand_err_msg

    watermark_payload, watermark_err_msg = _validate_watermark_payload(data.get('watermark'))
    if not watermark_payload:
        return None, watermark_err_msg

    payload = {}
    payload.update(brand_payload)
    payload.update(watermark_payload)
    return payload, ''


@swagger_auto_schema(
    method='post',
    operation_description='上传网站图片（Logo/Favicon）',
    manual_parameters=[
        openapi.Parameter('kind', openapi.IN_FORM, description='图片类型: logo 或 favicon', type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('file', openapi.IN_FORM, description='图片文件', type=openapi.TYPE_FILE, required=True),
    ],
    responses={200: '上传成功', 400: '参数错误', 403: '权限不足'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_website_image(request):
    if not _is_admin_user(request.user):
        return error_response('无权限上传网站图片', ERROR_CODE_FORBIDDEN, status.HTTP_403_FORBIDDEN)

    image_kind = (request.data.get('kind') or '').strip().lower()
    if image_kind not in WEBSITE_IMAGE_KIND_SET:
        return error_response('图片类型不支持', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    upload_file = request.FILES.get('file')
    if not upload_file:
        return error_response('上传文件不能为空', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    binary = upload_file.read()
    if not binary:
        return error_response('上传文件不能为空', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    image_url, err_msg = _upload_binary_to_minio(binary, upload_file.content_type, image_kind, upload_file.name)
    if err_msg:
        return error_response(err_msg, ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    return success_response({'url': image_url}, '上传成功')


@swagger_auto_schema(
    method='get',
    operation_description='获取图形验证码',
    responses={
        200: openapi.Response(
            '获取成功',
            openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'code': openapi.Schema(type=openapi.TYPE_STRING),
                    'data': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'captchaId': openapi.Schema(type=openapi.TYPE_STRING),
                            'captchaImage': openapi.Schema(type=openapi.TYPE_STRING)
                        }
                    ),
                    'msg': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        )
    }
)
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_captcha(_request):
    code = _generate_captcha_code()
    captcha_id = _create_captcha_id(code)

    return success_response(
        {
            'captchaId': captcha_id,
            'captchaImage': _build_captcha_svg(code)
        },
        '获取验证码成功'
    )


@swagger_auto_schema(
    method='get',
    operation_description='健康检查接口',
    responses={
        200: openapi.Response(
            '成功',
            openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'code': openapi.Schema(type=openapi.TYPE_STRING),
                    'data': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={'status': openapi.Schema(type=openapi.TYPE_STRING)}
                    ),
                    'msg': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        )
    }
)
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def health_check(_request):
    return success_response({'status': 'ok'})


@swagger_auto_schema(
    method='get',
    operation_description='获取数据调度任务提取结果概览',
    responses={200: '获取成功', 401: '未认证'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_data_schedule_extract_summary(_request, task_id):
    all_fields = _get_data_schedule_fields(task_id)
    summary = _get_data_schedule_summary(task_id)
    summary['counts'] = _build_data_schedule_counts(all_fields)
    return success_response(summary, '获取成功')


@swagger_auto_schema(
    method='get',
    operation_description='获取数据调度任务提取字段结果列表',
    manual_parameters=[
        openapi.Parameter('scope', openapi.IN_QUERY, description='筛选范围: all/complete/missing', type=openapi.TYPE_STRING),
        openapi.Parameter('current', openapi.IN_QUERY, description='页码，默认1', type=openapi.TYPE_INTEGER),
        openapi.Parameter('size', openapi.IN_QUERY, description='每页条数，默认20，最大200', type=openapi.TYPE_INTEGER),
    ],
    responses={200: '获取成功', 400: '参数错误', 401: '未认证'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_data_schedule_extract_fields(request, task_id):
    scope = _normalize_data_schedule_scope(request.query_params.get('scope'))
    if scope is None:
        return error_response('scope 参数无效，仅支持 all/complete/missing', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    current = _parse_positive_int(request.query_params.get('current'), default=1, max_value=100000)
    size = _parse_positive_int(request.query_params.get('size'), default=20, max_value=200)

    all_fields = _get_data_schedule_fields(task_id)
    filtered_fields = _filter_data_schedule_fields_by_scope(all_fields, scope)
    field_records = [_to_data_schedule_field_record(item) for item in filtered_fields]
    paginated_data = _paginate_data_schedule_records(field_records, current, size)
    paginated_data['scope'] = scope
    paginated_data['counts'] = _build_data_schedule_counts(all_fields)

    return success_response(paginated_data, '获取成功')


@swagger_auto_schema(
    method='get',
    operation_description='获取字段下钻详情数据',
    manual_parameters=[
        openapi.Parameter('fieldKey', openapi.IN_QUERY, description='字段标识', type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('scope', openapi.IN_QUERY, description='筛选范围: all/complete/missing', type=openapi.TYPE_STRING),
        openapi.Parameter('current', openapi.IN_QUERY, description='页码，默认1', type=openapi.TYPE_INTEGER),
        openapi.Parameter('size', openapi.IN_QUERY, description='每页条数，默认20，最大200', type=openapi.TYPE_INTEGER),
    ],
    responses={200: '获取成功', 400: '参数错误', 404: '字段不存在', 401: '未认证'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_data_schedule_extract_drilldown(request, task_id):
    field_key = str(request.query_params.get('fieldKey') or '').strip()
    if not field_key:
        return error_response('fieldKey 不能为空', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    scope = _normalize_data_schedule_scope(request.query_params.get('scope'))
    if scope is None:
        return error_response('scope 参数无效，仅支持 all/complete/missing', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    current = _parse_positive_int(request.query_params.get('current'), default=1, max_value=100000)
    size = _parse_positive_int(request.query_params.get('size'), default=20, max_value=200)

    all_fields = _get_data_schedule_fields(task_id)
    field_map = {item.get('fieldKey'): item for item in all_fields}
    field_item = field_map.get(field_key)
    if not field_item:
        return error_response('字段不存在', ERROR_CODE_NOT_FOUND, status.HTTP_404_NOT_FOUND)
    if not field_item.get('canDrilldown'):
        return error_response('当前字段不支持下钻', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    payload = DATA_SCHEDULE_DRILLDOWN_MOCK.get(field_key)
    if not payload:
        return error_response('下钻数据不存在', ERROR_CODE_NOT_FOUND, status.HTTP_404_NOT_FOUND)

    records = payload.get('records') or []
    if scope != DATA_SCHEDULE_SCOPE_ALL and field_item.get('status') != scope:
        records = []

    paginated_data = _paginate_data_schedule_records(records, current, size)
    paginated_data.update(
        {
            'actions': {
                'canCreate': True,
                'canDelete': True,
                'canEdit': True
            },
            'columns': payload.get('columns') or [],
            'fieldKey': field_key,
            'scope': scope,
            'title': payload.get('title') or f"字段详情 - {field_item.get('fieldName') or field_key}",
        }
    )

    return success_response(paginated_data, '获取成功')


@swagger_auto_schema(
    method='get',
    operation_description='导出数据调度提取结果（xlsx，支持下钻 Sheet 跳转）',
    manual_parameters=[
        openapi.Parameter('scope', openapi.IN_QUERY, description='筛选范围: all/complete/missing', type=openapi.TYPE_STRING),
    ],
    responses={200: '导出成功', 400: '参数错误', 500: '导出失败', 401: '未认证'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_data_schedule_extract_result(request, task_id):
    scope = _normalize_data_schedule_scope(request.query_params.get('scope'))
    if scope is None:
        return error_response('scope 参数无效，仅支持 all/complete/missing', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    try:
        binary = _build_data_schedule_export_binary(task_id, scope)
    except Exception:
        logger.exception('build data schedule export failed, task_id=%s, scope=%s', task_id, scope)
        return error_response('导出失败，请稍后重试', ERROR_CODE_INVALID_PARAMS, status.HTTP_500_INTERNAL_SERVER_ERROR)

    filename = quote(f'data-schedule-{task_id}-{scope}.xlsx')
    response = HttpResponse(
        binary,
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f"attachment; filename*=UTF-8''{filename}"
    return response


@swagger_auto_schema(
    method='get',
    operation_description='获取网站设置',
    responses={200: '获取成功'}
)
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_website_settings(_request):
    settings_obj = _get_website_settings()
    return success_response(_website_settings_to_dict(settings_obj), '获取成功')


@swagger_auto_schema(
    method='get',
    operation_description='获取网站基础设置（名称/Logo/Favicon）',
    responses={200: '获取成功'}
)
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_website_brand_settings(_request):
    settings_obj = _get_website_settings()
    return success_response(_website_brand_settings_to_dict(settings_obj), '获取成功')


@swagger_auto_schema(
    method='post',
    operation_description='更新网站基础设置（名称/Logo/Favicon）',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['websiteName'],
        properties={
            'websiteName': openapi.Schema(type=openapi.TYPE_STRING, description='网站名称'),
            'logo': openapi.Schema(type=openapi.TYPE_STRING, description='网站 Logo URL'),
            'favicon': openapi.Schema(type=openapi.TYPE_STRING, description='网站图标 URL')
        }
    ),
    responses={200: '更新成功', 400: '参数错误', 403: '权限不足'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_website_brand_settings(request):
    if not _is_admin_user(request.user):
        return error_response('无权限修改网站设置', ERROR_CODE_FORBIDDEN, status.HTTP_403_FORBIDDEN)

    payload, err_msg = _validate_website_brand_payload(request.data or {})
    if not payload:
        return error_response(err_msg, ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        settings_obj = _get_website_settings_for_update()
        previous_logo = settings_obj.logo
        previous_favicon = settings_obj.favicon

        is_changed = (
            settings_obj.website_name != payload['website_name']
            or settings_obj.logo != payload['logo']
            or settings_obj.favicon != payload['favicon']
        )
        if not is_changed:
            return success_response(True, '设置未发生变化')

        settings_obj.website_name = payload['website_name']
        settings_obj.logo = payload['logo']
        settings_obj.favicon = payload['favicon']
        settings_obj.save(update_fields=['website_name', 'logo', 'favicon', 'updated_at'])

    _cleanup_stale_website_assets(previous_logo, previous_favicon, payload['logo'], payload['favicon'])

    return success_response(True, '更新成功')


@swagger_auto_schema(
    method='get',
    operation_description='获取水印设置',
    responses={200: '获取成功'}
)
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_watermark_settings(_request):
    settings_obj = _get_website_settings()
    return success_response(_watermark_settings_to_dict(settings_obj), '获取成功')


@swagger_auto_schema(
    method='post',
    operation_description='更新水印设置',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'watermark': openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'enabled': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='是否启用水印'),
                    'hiddenMode': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='是否启用隐藏水印模式'),
                    'text': openapi.Schema(type=openapi.TYPE_STRING, description='水印文字'),
                    'fontSize': openapi.Schema(type=openapi.TYPE_INTEGER, description='水印字号'),
                    'opacity': openapi.Schema(type=openapi.TYPE_NUMBER, description='水印透明度'),
                    'rotate': openapi.Schema(type=openapi.TYPE_INTEGER, description='水印旋转角度')
                }
            ),
            'enabled': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='是否启用水印（兼容字段）'),
            'hiddenMode': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='是否启用隐藏水印模式（兼容字段）'),
            'text': openapi.Schema(type=openapi.TYPE_STRING, description='水印文字（兼容字段）'),
            'fontSize': openapi.Schema(type=openapi.TYPE_INTEGER, description='水印字号（兼容字段）'),
            'opacity': openapi.Schema(type=openapi.TYPE_NUMBER, description='水印透明度（兼容字段）'),
            'rotate': openapi.Schema(type=openapi.TYPE_INTEGER, description='水印旋转角度（兼容字段）')
        }
    ),
    responses={200: '更新成功', 400: '参数错误', 403: '权限不足'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_watermark_settings(request):
    if not _is_admin_user(request.user):
        return error_response('无权限修改水印设置', ERROR_CODE_FORBIDDEN, status.HTTP_403_FORBIDDEN)

    request_data = request.data or {}
    watermark_data = request_data.get('watermark') if isinstance(request_data, dict) else None
    if watermark_data is None:
        watermark_data = request_data

    payload, err_msg = _validate_watermark_payload(watermark_data)
    if not payload:
        return error_response(err_msg, ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        settings_obj = _get_website_settings_for_update()
        supports_hidden_mode = _supports_watermark_hidden_mode()

        is_changed = (
            settings_obj.watermark_enabled != payload['watermark_enabled']
            or (supports_hidden_mode and settings_obj.watermark_hidden_mode != payload['watermark_hidden_mode'])
            or settings_obj.watermark_text != payload['watermark_text']
            or settings_obj.watermark_font_size != payload['watermark_font_size']
            or settings_obj.watermark_opacity != payload['watermark_opacity']
            or settings_obj.watermark_rotate != payload['watermark_rotate']
        )
        if not is_changed:
            return success_response(True, '设置未发生变化')

        settings_obj.watermark_enabled = payload['watermark_enabled']
        settings_obj.watermark_text = payload['watermark_text']
        settings_obj.watermark_font_size = payload['watermark_font_size']
        settings_obj.watermark_opacity = payload['watermark_opacity']
        settings_obj.watermark_rotate = payload['watermark_rotate']

        update_fields = [
            'watermark_enabled',
            'watermark_text',
            'watermark_font_size',
            'watermark_opacity',
            'watermark_rotate',
            'updated_at'
        ]
        if supports_hidden_mode:
            settings_obj.watermark_hidden_mode = payload['watermark_hidden_mode']
            update_fields.insert(1, 'watermark_hidden_mode')

        settings_obj.save(update_fields=update_fields)

    return success_response(True, '更新成功')


@swagger_auto_schema(
    method='post',
    operation_description='更新网站设置',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['websiteName'],
        properties={
            'websiteName': openapi.Schema(type=openapi.TYPE_STRING, description='网站名称'),
            'logo': openapi.Schema(type=openapi.TYPE_STRING, description='网站 Logo URL'),
            'favicon': openapi.Schema(type=openapi.TYPE_STRING, description='网站图标 URL'),
            'watermark': openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'enabled': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='是否启用水印'),
                    'hiddenMode': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='是否启用隐藏水印模式'),
                    'text': openapi.Schema(type=openapi.TYPE_STRING, description='水印文字'),
                    'fontSize': openapi.Schema(type=openapi.TYPE_INTEGER, description='水印字号'),
                    'opacity': openapi.Schema(type=openapi.TYPE_NUMBER, description='水印透明度'),
                    'rotate': openapi.Schema(type=openapi.TYPE_INTEGER, description='水印旋转角度')
                }
            )
        }
    ),
    responses={200: '更新成功', 400: '参数错误', 403: '权限不足'}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_website_settings(request):
    if not _is_admin_user(request.user):
        return error_response('无权限修改网站设置', ERROR_CODE_FORBIDDEN, status.HTTP_403_FORBIDDEN)

    payload, err_msg = _validate_website_settings_payload(request.data or {})
    if not payload:
        return error_response(err_msg, ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        settings_obj = _get_website_settings_for_update()
        previous_logo = settings_obj.logo
        previous_favicon = settings_obj.favicon
        supports_hidden_mode = _supports_watermark_hidden_mode()

        is_changed = (
            settings_obj.website_name != payload['website_name']
            or settings_obj.logo != payload['logo']
            or settings_obj.favicon != payload['favicon']
            or settings_obj.watermark_enabled != payload['watermark_enabled']
            or (supports_hidden_mode and settings_obj.watermark_hidden_mode != payload['watermark_hidden_mode'])
            or settings_obj.watermark_text != payload['watermark_text']
            or settings_obj.watermark_font_size != payload['watermark_font_size']
            or settings_obj.watermark_opacity != payload['watermark_opacity']
            or settings_obj.watermark_rotate != payload['watermark_rotate']
        )
        if not is_changed:
            return success_response(True, '设置未发生变化')

        settings_obj.website_name = payload['website_name']
        settings_obj.logo = payload['logo']
        settings_obj.favicon = payload['favicon']
        settings_obj.watermark_enabled = payload['watermark_enabled']
        settings_obj.watermark_text = payload['watermark_text']
        settings_obj.watermark_font_size = payload['watermark_font_size']
        settings_obj.watermark_opacity = payload['watermark_opacity']
        settings_obj.watermark_rotate = payload['watermark_rotate']

        update_fields = [
            'website_name',
            'logo',
            'favicon',
            'watermark_enabled',
            'watermark_text',
            'watermark_font_size',
            'watermark_opacity',
            'watermark_rotate',
            'updated_at'
        ]
        if supports_hidden_mode:
            settings_obj.watermark_hidden_mode = payload['watermark_hidden_mode']
            update_fields.insert(4, 'watermark_hidden_mode')

        settings_obj.save(update_fields=update_fields)

    _cleanup_stale_website_assets(previous_logo, previous_favicon, payload['logo'], payload['favicon'])

    return success_response(True, '更新成功')


@swagger_auto_schema(
    method='post',
    operation_description='用户登录',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['userName', 'password', 'captchaId', 'captchaCode'],
        properties={
            'userName': openapi.Schema(type=openapi.TYPE_STRING, description='用户名'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='密码'),
            'captchaId': openapi.Schema(type=openapi.TYPE_STRING, description='验证码标识'),
            'captchaCode': openapi.Schema(type=openapi.TYPE_STRING, description='验证码')
        }
    ),
    responses={
        200: openapi.Response(
            '登录结果（成功或业务错误）',
            openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'code': openapi.Schema(type=openapi.TYPE_STRING),
                    'data': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'token': openapi.Schema(type=openapi.TYPE_STRING),
                            'refreshToken': openapi.Schema(type=openapi.TYPE_STRING)
                        }
                    ),
                    'msg': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        400: '参数错误',
        403: '用户被禁用'
    }
)
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def user_login(request):
    username = _clean_username(request.data.get('userName'))
    password = request.data.get('password') or ''
    captcha_id = (request.data.get('captchaId') or '').strip()
    captcha_code = (request.data.get('captchaCode') or '').strip()
    client_ip = _extract_client_ip(request)
    login_subject = _build_login_subject(username, client_ip)

    validation_error = _validate_login_payload(username, password, captcha_id)
    if validation_error:
        msg, code, http_status = validation_error
        return error_response(msg, code, http_status)

    lock_remaining = _get_login_lock_remaining(login_subject)
    if lock_remaining:
        logger.warning('login blocked by lock, subject=%s, ip=%s, remaining=%s', login_subject, client_ip, lock_remaining)
        return error_response(f'登录失败次数过多，请{lock_remaining}秒后重试', ERROR_CODE_AUTH_FAILED, status.HTTP_200_OK)

    is_captcha_valid, captcha_err_msg = _verify_captcha(captcha_id, captcha_code)
    if not is_captcha_valid:
        logger.warning('login failed captcha, subject=%s, ip=%s, reason=%s', login_subject, client_ip, captcha_err_msg)
        return error_response(captcha_err_msg, ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    matched_user = User.objects.filter(username=username).first()
    if not matched_user:
        # Fall back to case-insensitive lookup for legacy users while preferring stable ordering.
        matched_user = User.objects.filter(username__iexact=username).order_by('id').first()
    auth_username = matched_user.username if matched_user else username
    user = authenticate(username=auth_username, password=password)
    if not user:
        lock_seconds = _register_login_failure(login_subject)
        logger.warning('login failed credential, subject=%s, ip=%s', login_subject, client_ip)
        if lock_seconds:
            return error_response(
                f'账号或密码错误，已临时锁定{lock_seconds}秒，请稍后重试',
                ERROR_CODE_AUTH_FAILED,
                status.HTTP_200_OK
            )
        # Keep login credential mismatch as business error under HTTP 200 for frontend contract compatibility.
        return error_response('账号或密码错误', ERROR_CODE_AUTH_FAILED, status.HTTP_200_OK)

    if not user.is_active:
        logger.warning('login rejected inactive user, uid=%s, ip=%s', user.id, client_ip)
        return error_response('用户已被禁用', ERROR_CODE_FORBIDDEN, status.HTTP_403_FORBIDDEN)

    _clear_login_failure_state(login_subject)
    logger.info('login success, uid=%s, subject=%s, ip=%s', user.id, login_subject, client_ip)

    return success_response(_issue_auth_tokens(user), '登录成功')


@swagger_auto_schema(
    method='post',
    operation_description='用户注册',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['username', 'password'],
        properties={
            'username': openapi.Schema(type=openapi.TYPE_STRING, description='用户名'),
            'userName': openapi.Schema(type=openapi.TYPE_STRING, description='用户名（兼容字段）'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='密码'),
            'email': openapi.Schema(type=openapi.TYPE_STRING, description='邮箱（可选）')
        }
    ),
    responses={
        201: openapi.Response(
            '注册成功',
            openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'code': openapi.Schema(type=openapi.TYPE_STRING),
                    'data': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'token': openapi.Schema(type=openapi.TYPE_STRING),
                            'refreshToken': openapi.Schema(type=openapi.TYPE_STRING)
                        }
                    ),
                    'msg': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        400: '参数错误或用户已存在'
    }
)
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def user_register(request):
    username = _clean_username(request.data.get('username') or request.data.get('userName'))
    password = request.data.get('password') or ''
    email = (request.data.get('email') or '').strip()

    if not username or not password:
        return error_response('用户名和密码不能为空', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username__iexact=username).exists():
        return error_response('用户名已存在', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(password)
    except ValidationError as exc:
        return error_response(exc.messages[0], ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)

    return success_response(_issue_auth_tokens(user), '注册成功', status.HTTP_201_CREATED)


@swagger_auto_schema(
    method='post',
    operation_description='刷新登录令牌',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['refreshToken'],
        properties={
            'refreshToken': openapi.Schema(type=openapi.TYPE_STRING, description='刷新令牌')
        }
    ),
    responses={
        200: '刷新成功',
        401: '刷新令牌无效或过期'
    }
)
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token_value = request.data.get('refreshToken') or ''
    if not refresh_token_value:
        return error_response('refreshToken 不能为空', ERROR_CODE_INVALID_PARAMS, status.HTTP_400_BAD_REQUEST)

    try:
        payload = _parse_refresh_token(refresh_token_value)
    except signing.BadSignature:
        return error_response('refreshToken 无效或已过期', ERROR_CODE_AUTH_FAILED, status.HTTP_401_UNAUTHORIZED)

    user = User.objects.filter(id=payload.get('uid')).first()
    if not user:
        return error_response('用户不存在', ERROR_CODE_NOT_FOUND, status.HTTP_404_NOT_FOUND)

    if not user.is_active:
        return error_response('用户已被禁用', ERROR_CODE_FORBIDDEN, status.HTTP_403_FORBIDDEN)

    password_fingerprint = hashlib.sha256(user.password.encode('utf-8')).hexdigest()
    if payload.get('passwordFingerprint') != password_fingerprint:
        return error_response('refreshToken 已失效，请重新登录', ERROR_CODE_AUTH_FAILED, status.HTTP_401_UNAUTHORIZED)

    return success_response(_issue_auth_tokens(user), '刷新成功')


@swagger_auto_schema(
    method='get',
    operation_description='获取当前登录用户信息',
    responses={
        200: openapi.Response(
            '获取成功',
            openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'code': openapi.Schema(type=openapi.TYPE_STRING),
                    'data': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'buttons': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
                            'roles': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING)),
                            'userId': openapi.Schema(type=openapi.TYPE_STRING),
                            'userName': openapi.Schema(type=openapi.TYPE_STRING)
                        }
                    ),
                    'msg': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        401: '未认证'
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    return success_response(_build_user_info(request.user), '获取用户信息成功')


@swagger_auto_schema(
    method='post',
    operation_description='用户登出',
    responses={
        200: openapi.Response(
            '登出成功',
            openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'code': openapi.Schema(type=openapi.TYPE_STRING),
                    'data': openapi.Schema(type=openapi.TYPE_OBJECT),
                    'msg': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        )
    }
)
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def user_logout(request):
    token = _extract_auth_token(request)
    if token:
        Token.objects.filter(key=token).delete()

    return success_response({}, '退出成功')


@swagger_auto_schema(
    method='get',
    operation_description='返回自定义后端错误（用于前端调试）',
    manual_parameters=[
        openapi.Parameter('code', openapi.IN_QUERY, description='错误码', type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('msg', openapi.IN_QUERY, description='错误信息', type=openapi.TYPE_STRING, required=True)
    ],
    responses={400: '自定义错误'}
)
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def custom_error(request):
    code = str(request.query_params.get('code') or ERROR_CODE_INVALID_PARAMS)
    msg = (request.query_params.get('msg') or '自定义错误').strip()

    return error_response(msg, code=code, http_status=status.HTTP_400_BAD_REQUEST)
