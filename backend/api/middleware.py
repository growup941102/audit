import json
import logging
import traceback
from datetime import datetime
from pathlib import Path
from time import perf_counter


logger = logging.getLogger(__name__)
API_FAILURE_LOG_DIR = Path(__file__).resolve().parents[1] / 'logs'
API_FAILURE_LOG_FILE = API_FAILURE_LOG_DIR / 'api_failure.log'
MAX_BODY_CHARS = 2000


def _safe_json_dumps(value):
    try:
        return json.dumps(value, ensure_ascii=False)
    except Exception:
        return str(value)


def _truncate_text(text, max_chars=MAX_BODY_CHARS):
    raw = str(text or '')
    if len(raw) <= max_chars:
        return raw
    return f'{raw[:max_chars]}...(truncated)'


def _get_request_body_text(request):
    try:
        body = request.body or b''
    except Exception:
        return ''
    if not body:
        return ''
    try:
        return _truncate_text(body.decode('utf-8', errors='replace'))
    except Exception:
        return _truncate_text(body)


def _append_api_failure_log(record):
    try:
        API_FAILURE_LOG_DIR.mkdir(parents=True, exist_ok=True)
        with API_FAILURE_LOG_FILE.open('a', encoding='utf-8') as f:
            f.write(f'{_safe_json_dumps(record)}\n')
    except Exception:
        logger.exception('append api failure log failed')


def _build_common_record(request, elapsed_ms):
    return {
        'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'method': request.method,
        'path': request.path,
        'query': dict(request.GET.items()),
        'remoteAddr': request.META.get('REMOTE_ADDR', ''),
        'userId': getattr(getattr(request, 'user', None), 'id', None),
        'username': getattr(getattr(request, 'user', None), 'username', ''),
        'elapsedMs': round(elapsed_ms, 2),
    }


class ApiFailureLoggingMiddleware:
    """Log all /api/ failed responses and uncaught exceptions to local file."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started = perf_counter()
        try:
            response = self.get_response(request)
        except Exception as exc:
            elapsed_ms = (perf_counter() - started) * 1000
            if request.path.startswith('/api/'):
                record = _build_common_record(request, elapsed_ms)
                record.update(
                    {
                        'body': _get_request_body_text(request),
                        'errorType': type(exc).__name__,
                        'error': str(exc),
                        'statusCode': 500,
                        'traceback': traceback.format_exc(),
                    }
                )
                _append_api_failure_log(record)
                logger.exception('api exception: %s %s', request.method, request.path)
            raise

        if not request.path.startswith('/api/'):
            return response

        if response.status_code < 400:
            return response

        elapsed_ms = (perf_counter() - started) * 1000
        record = _build_common_record(request, elapsed_ms)
        record['statusCode'] = response.status_code
        record['body'] = _get_request_body_text(request)

        try:
            payload = json.loads(response.content.decode('utf-8', errors='replace'))
            record['code'] = payload.get('code')
            record['msg'] = payload.get('msg')
            record['response'] = payload
        except Exception:
            record['response'] = _truncate_text(getattr(response, 'content', b''))

        _append_api_failure_log(record)
        return response
