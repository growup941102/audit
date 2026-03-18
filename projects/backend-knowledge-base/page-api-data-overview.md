# 页面接口文档：数据概览

## 1. 页面概览
- 页面路由：`/data-fetch/data-overview`
- 页面入口：`frontend/src/pages/(base)/data-fetch/data-overview/index.tsx`
- 页面模块：
  - `KpiCards`：展示汇总 KPI
  - `TaskRanking`：展示分类 Top20

## 2. 前端调用入口
- URL 常量：`frontend/src/service/urls/data-overview.ts`
- API 封装：`frontend/src/service/api/data-overview.ts`
- Hooks：`frontend/src/service/hooks/useDataOverview.ts`
- 类型定义：`frontend/src/service/types/data-overview.d.ts`

## 3. 接口清单（按页面）

### 3.1 项目状态汇总
- 路径：`GET /api/admin/projects/status/summary/`
- 鉴权：`IsAuthenticated`
- 请求参数：无
- 响应字段：
  - `totalProjects`
  - `runningProjects`
  - `successProjects`
  - `failedProjects`
  - `pendingProjects`
- 页面消费：
  - `KpiCards` 映射
    - `successProjects -> completed`
    - `runningProjects -> running`
    - `pendingProjects -> remaining`
    - `failedProjects -> abnormal`

### 3.2 单项目状态明细
- 路径：`GET /api/admin/projects/{projectId}/status/`
- 鉴权：`IsAuthenticated`
- 请求参数：
  - 路径参数 `projectId`（必填）
- 关键响应字段：
  - `projectId` `projectName`
  - `status` `statusLabel`
  - `currentStepNo` `currentStepName`
  - `latestTaskStatus` `latestTaskStepNo` `latestTaskUpdatedAt`
  - `lastError`
  - `fileStats.*`
- 典型错误：
  - `400`: `projectId 不能为空`
  - `404`: `项目不存在`

### 3.3 项目状态排名
- 路径：`GET /api/admin/projects/status/ranking/`
- 鉴权：`IsAuthenticated`
- 请求参数（query）：
  - `category`: `completed|running|remaining|abnormal`
  - `startTime`: `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss`
  - `endTime`: `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss`
  - `limit`: 默认 20，最大 100
- 响应字段：
  - `category`
  - `total`
  - `records[]`: `rank/projectId/name/completeTime/status`
- 页面消费：
  - `TaskRanking` 默认传 `limit=20`，并按分类和时间范围刷新。

## 4. /summary 接口串联链路（你关心的重点）
1. 前端页面 `KpiCards` 调用 `useProjectStatusSummary`。
2. Hook 调 `fetchProjectStatusSummary`。
3. API 请求 `/api/admin/projects/status/summary/`。
4. Django 根路由 `tjsj/urls.py` 把 `/api/` 转发给 `api/urls.py`。
5. `api/urls.py` 将 `admin/projects/status/summary/` 绑定到 `get_project_status_summary`。
6. `get_project_status_summary` 调用 `_build_project_status_rows()` 聚合项目状态行。
7. 再调用 `_build_project_summary_payload()` 把行数据累计成 5 个 KPI。
8. 通过统一 `success_response` 返回。

## 5. /summary 读取的库表与用途

### 5.1 `c_r_cm_project`
- 用途：拿项目基础信息（`project_id`、`project_name`）。
- 函数：`_fetch_project_name_rows()`

### 5.2 `c_r_cm_file_prepare`
- 用途：按项目聚合文件统计与文件侧错误信息。
- 函数：`_fetch_project_file_snapshot_rows()`
- 聚合字段示例：
  - `totalFiles/nonDraftFiles/draftFiles`
  - `pendingFiles/runningFiles/successFiles/failedFiles/partialFailedFiles`
  - `step3SuccessFiles`
  - `maxCurrentStep/runningStepNo/latestFileError`

### 5.3 `c_r_cm_task_item_queue`
- 用途：拿每个项目最新任务快照（状态、步骤、错误、更新时间）。
- 函数：`_fetch_latest_project_task_rows()`
- 过滤条件：`file_id LIKE 'PROJECT:%'`

## 6. 状态判定逻辑（核心业务规则）
在 `_resolve_project_status(file_snapshot, task_snapshot)` 中按优先级判定：
1. `RUNNING`：有运行中文件，或任务状态在 `RUNNING/CLAIMED/LOCKED`。
2. `SUCCESS`：非草稿文件存在，且 `step3SuccessFiles >= nonDraftFiles`。
3. `PARTIAL_FAILED`：任务是部分失败，或失败类文件占比介于 0 和非草稿总数之间。
4. `FAILED`：任务状态 `FAILED/CANCELLED`，或存在失败类文件。
5. 否则 `PENDING`。

之后 `_build_project_summary_payload()` 再把状态计数为：
- `RUNNING -> runningProjects`
- `SUCCESS -> successProjects`
- `FAILED/PARTIAL_FAILED -> failedProjects`
- 其他 -> `pendingProjects`

## 7. 关键代码位置
- 根路由挂载：`backend/tjsj/urls.py`
- 数据概览路由：`backend/api/urls.py`
- 汇总/详情/排名接口：`backend/api/views.py`
- 状态聚合 SQL 与逻辑：`backend/api/views.py`
- 前端 URL/API/Hook：
  - `frontend/src/service/urls/data-overview.ts`
  - `frontend/src/service/api/data-overview.ts`
  - `frontend/src/service/hooks/useDataOverview.ts`
  - `frontend/src/pages/(base)/data-fetch/data-overview/modules/KpiCards.tsx`
  - `frontend/src/pages/(base)/data-fetch/data-overview/modules/TaskRanking.tsx`

## 8. 常见失败与排查
- 现象：`/summary` 返回 500，提示“请检查数据库连接”。
- 排查入口：
  - `backend/logs/api_failure.log`
  - `backend/docs/database-config-troubleshooting.md`
- 常见原因：
  - `MYSQL_HOST/MYSQL_PORT/MYSQL_USERNAME/MYSQL_PASSWORD/MYSQL_DATABASE` 配置不匹配。
  - 环境变量污染导致实际连接库与预期不一致。

## 9. 后端接口编写示例（可复用模板）

```python
@swagger_auto_schema(
    method='get',
    operation_description='示例：获取某页面统计',
    responses={200: '获取成功', 401: '未认证'}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_demo_summary(_request):
    try:
        sql = (
            "SELECT COUNT(*) AS total, "
            "SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS successCount "
            "FROM your_table "
            "WHERE deleted = 0"
        )
        with connection.cursor() as cursor:
            cursor.execute(sql)
            rows = _dictfetchall(cursor)

        row = rows[0] if rows else {}
        payload = {
            'total': _to_int(row.get('total')),
            'successCount': _to_int(row.get('successCount')),
        }
        return success_response(payload, '获取成功')
    except Exception as exc:
        logger.exception('get demo summary failed: %s', exc)
        return error_response('统计查询失败，请检查数据库连接', ERROR_CODE_INVALID_PARAMS, status.HTTP_500_INTERNAL_SERVER_ERROR)
```

编写要点：
1. 路由注册在 `api/urls.py`，路径统一放在 `/api/...` 下。
2. 先做参数校验，再执行查询。
3. 查询结果先归一化（`_to_int/_to_str`），再组装返回。
4. 统一使用 `success_response/error_response`。
5. 异常必须 `logger.exception`，便于联调排查。

