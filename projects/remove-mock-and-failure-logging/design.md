# 设计文档

## 1. 概述
- 对应需求文档：`projects/remove-mock-and-failure-logging/requirement.md`
- 设计目标：让未接入真实数据源的问题可见、可追踪、可回溯。

## 2. 方案摘要
- 前端方案：
  - 将原 mock 数据入口改为显式抛错或空集，不再提供伪造业务结果。
  - `data-overview` 组件取消占位补齐（如固定填充 20 条）。
- 后端方案：
  - data-schedule mock 数据函数改为直接抛错。
  - 新增 `ApiFailureLoggingMiddleware`，记录 `/api/` 失败响应与异常。
  - 增加失败日志读取接口。
- 文档方案：
  - 新增 `ai-audit-agent-reference.md`，沉淀状态接口、表、Nacos 配置关键点。

## 3. 文件规划
### 新增文件
- `backend/api/middleware.py`
- `projects/backend-knowledge-base/ai-audit-agent-reference.md`

### 修改文件
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/tjsj/settings.py`
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/mock.ts`
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/chooseDataMock.ts`
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/ScheduleCreateView.tsx`
- `frontend/src/pages/(base)/data-fetch/data-overview/modules/KpiCards.tsx`
- `frontend/src/pages/(base)/data-fetch/data-overview/modules/TaskRanking.tsx`
- `projects/backend-knowledge-base/README.md`
- `projects/backend-knowledge-base/frontend-backend-contracts.md`

## 4. 接口设计
- 新增日志接口：
  - `GET /api/admin/logs/api-failures/`
  - 参数：`lines`（默认 200，最大 2000）、`keyword`（可选）
  - 返回：日志文件路径、记录数组、数量。

## 5. 风险与兜底
- 风险：移除 mock 后，未接真实源的页面会直接报错。
- 兜底：通过失败日志接口快速定位请求路径、参数、错误码与异常堆栈。
