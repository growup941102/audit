# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-schedule-projectid-log-api/requirement.md`
- 设计目标：将“数据提取日志”改为按 `projectId` 读取 `c_r_cm_task_item_queue` 的真实数据。

## 2. 方案摘要
- 前端方案：日志弹窗请求参数增加 `projectId`，并在列表页打开弹窗时透传当前行项目 ID。
- 后端方案：日志元信息、日志列表、日志导出统一支持 `projectId`；日志记录由队列表行映射而来。
- 数据流转：列表行点击查看日志 -> 传 `taskId + projectId` -> 后端按 `projectId` 查询队列表 -> 返回日志展示数据。

## 3. 架构与模块拆分
### 前端
- 页面/容器：`data-schedule/index.tsx`
- 可复用组件：`ScheduleLogModal`
- Hooks / Services：
  - `service/types/data-schedule.d.ts`
  - `service/api/data-schedule.ts`
  - `service/hooks/useDataSchedule.ts`

### 后端
- Django App：`backend/api`
- Views / API：`get_data_schedule_logs_meta` / `get_data_schedule_logs` / `export_data_schedule_logs`
- Models：无新增
- Migrations：无

## 4. 文件规划
### 新增文件
- `backend/api/tests/test_data_schedule_logs_queue_source.py`：日志真实数据源单元测试。

### 修改文件
- `backend/api/views.py`：补充项目日志查询与映射 helper，替换占位逻辑。
- `frontend/src/pages/(base)/data-fetch/data-schedule/index.tsx`：弹窗状态增加 `projectId`。
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/ScheduleLogModal.tsx`：请求参数透传 `projectId`。
- `frontend/src/service/types/data-schedule.d.ts`：日志请求类型增加 `projectId`。
- `frontend/src/service/api/data-schedule.ts`：日志请求与导出请求透传 `projectId`。
- `frontend/src/service/hooks/useDataSchedule.ts`：日志 hooks 支持 `projectId` 参数。

## 5. 接口设计
- 接口地址：保持原路径
  - `GET /api/data-schedule/tasks/{task_id}/logs/meta/`
  - `GET /api/data-schedule/tasks/{task_id}/logs/`
  - `GET /api/data-schedule/tasks/{task_id}/logs/export/`
- 请求参数新增：
  - `projectId`（可选，优先使用；为空时回退 task_id 解析）
- 响应结构：维持原日志结构，兼容前端已有表格。
- 异常处理：
  - 表不存在或查询异常返回友好错误；
  - 项目无日志返回空 records。

## 6. 数据模型设计
- 表：`c_r_cm_task_item_queue`
- 关键字段：
  - `project_id`
  - `resource_id`
  - `file_id`
  - `status`
  - `step_no`
  - `last_error`
  - `updated_at`（及可选时间字段）
- 约束：只读查询，不执行 DML/DDL。

## 7. 状态与交互设计
- 初始状态：默认按时间倒序显示最近日志。
- 用户操作：沿用现有筛选、排序、导出逻辑。
- 边界场景：
  - `projectId` 无效 -> 返回空日志或错误提示；
  - 队列表无记录 -> 空态。

## 8. 复用与封装设计
- 需要抽离的组件：无新增 UI 组件。
- 需要抽离的公共工具：后端新增日志映射 helper，减少 endpoint 重复逻辑。
- 为什么需要封装：meta/list/export 共享同一数据源与字段映射。

## 9. 文档计划
- 需要补充的后端文档：在本需求文档中说明新参数 `projectId` 与查询行为。
- 需要新增的功能文档：本目录三份文档。
- 面向前端同学的说明：日志接口优先使用 `projectId`，`taskId` 仅保留兼容。

## 10. MCP 与外部依赖
- 是否需要 MCP：否
- 使用目的：无
- 预期输入/输出：无

## 11. 测试方案
- 前端验证：查看日志时请求携带 `projectId`。
- 后端验证：按 `projectId` 查询、映射、筛选、空态场景单测。
- 手工验证：在数据调度页面打开日志弹窗并检查数据可读性。

## 12. 风险
- 技术风险：队列表字段在不同库实例中可能有差异。
- 回滚/兜底方案：若异常，可临时回退至旧占位逻辑并保留参数扩展代码。
