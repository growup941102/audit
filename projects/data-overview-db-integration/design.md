# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-overview-db-integration/requirement.md`
- 设计目标：参考 `ai-audit-agent` 状态计算逻辑，完成数据概览页真实数据接入。

## 2. 方案摘要
- 前端方案：
  - 新增 `data-overview` service/hook/type；
  - `KpiCards` 使用 summary；
  - `TaskRanking` 使用 ranking；
  - 保留现有 UI 风格。
- 后端方案：
  - 在 Django `views.py` 增加状态聚合与排名查询逻辑；
  - 路由采用 `/api/admin/projects/...`，与参考项目路径语义对齐；
  - 查询仅使用只读 SQL。
- 数据流转：
  1. 前端进入概览页请求 summary；
  2. 前端按分类/时间请求 ranking；
  3. 详情页或后续场景可请求单项目 status。

## 3. 架构与模块拆分
### 前端
- `service/urls/data-overview.ts`：接口 URL。
- `service/api/data-overview.ts`：接口请求封装。
- `service/hooks/useDataOverview.ts`：React Query Hook。
- `service/types/data-overview.d.ts`：类型定义。
- 页面组件：
  - `KpiCards.tsx`
  - `TaskRanking.tsx`

### 后端
- `backend/api/views.py`：
  - 只读 SQL 查询函数；
  - 状态计算函数（对齐参考项目口径）；
  - 3 个 HTTP 处理函数。
- `backend/api/urls.py`：新增路由注册。
- `backend/tjsj/settings.py`：数据库环境变量别名兼容。

## 4. 文件规划
### 新增文件
- `frontend/src/service/urls/data-overview.ts`
- `frontend/src/service/api/data-overview.ts`
- `frontend/src/service/hooks/useDataOverview.ts`
- `frontend/src/service/types/data-overview.d.ts`

### 修改文件
- `frontend/src/service/urls/index.ts`
- `frontend/src/service/api/index.ts`
- `frontend/src/service/hooks/index.ts`
- `frontend/src/service/keys/index.ts`
- `frontend/src/pages/(base)/data-fetch/data-overview/modules/KpiCards.tsx`
- `frontend/src/pages/(base)/data-fetch/data-overview/modules/TaskRanking.tsx`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/tjsj/settings.py`

## 5. 接口设计

### 5.1 汇总接口
- 路径：`GET /api/admin/projects/status/summary/`
- 响应：
  - `totalProjects`
  - `runningProjects`
  - `successProjects`
  - `failedProjects`
  - `pendingProjects`

### 5.2 单项目状态接口
- 路径：`GET /api/admin/projects/{projectId}/status/`
- 响应：
  - `projectId` `projectName`
  - `status` `statusLabel`
  - `currentStepNo` `currentStepName`
  - `latestTaskStatus` `latestTaskStepNo` `latestTaskUpdatedAt`
  - `lastError`
  - `fileStats`

### 5.3 排名接口
- 路径：`GET /api/admin/projects/status/ranking/`
- 参数：
  - `category`: `completed|running|remaining|abnormal`
  - `startTime`/`endTime`: 日期或日期时间（可选）
  - `limit`: 默认 20，最大 100
- 响应：
  - `category`
  - `total`
  - `records[]`：`rank/projectId/name/completeTime/status`

## 6. 状态口径设计（对齐参考项目）
- `RUNNING`：文件运行中或最新任务状态为运行态。
- `SUCCESS`：非草稿文件全部达到成功步骤。
- `PARTIAL_FAILED`：存在部分失败混合态。
- `FAILED`：存在失败态。
- `PENDING`：其余情况。

分类映射：
- `completed` -> `SUCCESS`
- `running` -> `RUNNING`
- `remaining` -> `PENDING`
- `abnormal` -> `FAILED | PARTIAL_FAILED`

## 7. 数据库连接兼容设计
- 现状：`settings.py` 依赖 `DB_HOST/DB_PORT/MYSQL_USER` 等变量。
- 调整：
  - `HOST` 支持 `MYSQL_HOST` 回退 `DB_HOST`
  - `PORT` 支持 `MYSQL_PORT` 回退 `DB_PORT`
  - `USER` 支持 `MYSQL_USERNAME` 回退 `MYSQL_USER`
- 目的：兼容参考项目/运维环境变量习惯，降低切换成本。

## 8. MCP 与外部依赖
- 本次不使用 MCP，不引入外部写操作副作用。
- 查询全为只读 SQL。

## 9. 测试方案
- 后端：
  - summary/detail/ranking 参数与返回校验；
  - 项目不存在 404 校验；
  - category 与时间参数非法值校验。
- 前端：
  - KPI 与排名是否正确渲染；
  - 分类切换/日期变更是否触发请求；
  - 空数据场景是否可展示。

## 10. 风险
- 技术风险：
  - 目标表结构与参考项目不一致时可能需要额外字段兼容。
- 回滚/兜底方案：
  - 仅新增接口与前端读取逻辑，可快速回退到原 mock 方案。
