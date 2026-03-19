# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-schedule-industry-detail-realtime/requirement.md`
- 设计目标：将数据调度详情从 mock 切换为行业真实表查询，并补齐 detail 接口。

## 2. 方案摘要
- 前端方案：新增 `fetchDataScheduleTaskDetail` + hook，详情页任务信息改用 detail 接口。
- 后端方案：
  - 新增 detail 接口；
  - 基于“任务上下文中的 `project_id(file_prepare_project_id)` -> `c_r_cm_kb_project_relation.project_id` 映射 + `industry`”动态读取 SW/JS 表；
  - fields 输出“注释名 + 值”，并做去重与查看项注入；
  - drilldown 按行业规则查目标表。
- 数据流转：`taskId -> file_prepare_project_id + industry -> kb_relation 映射 project_id -> SW/JS fields/detail/drilldown`。

## 3. 架构与模块拆分
### 前端
- 页面/容器：`ScheduleDetailView`
- Hooks / Services：`service/api/data-schedule.ts`、`service/hooks/useDataSchedule.ts`

### 后端
- Django App：`backend/api`
- Views / API：`views.py`
- Models：无新增
- Migrations：无新增

## 4. 文件规划
### 修改文件
- `backend/api/views.py`：新增 detail + 行业字段/下钻真实查询逻辑
- `backend/api/urls.py`：新增 detail 路由
- `frontend/src/service/urls/data-schedule.ts`：新增 detail URL
- `frontend/src/service/api/data-schedule.ts`：新增 detail API
- `frontend/src/service/hooks/useDataSchedule.ts`：新增 detail hook
- `frontend/src/service/types/data-schedule.d.ts`：新增 TaskDetail 类型
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/ScheduleDetailView.tsx`：切换任务信息数据源

## 5. 接口设计
- `GET /api/data-schedule/tasks/{taskId}/detail/`
  - 返回：`taskId/projectName/bidNo/creator/createTime/status/progress/counts`
- `GET /api/data-schedule/tasks/{taskId}/extract-result/fields/`
  - 行业化字段聚合 + scope + 分页
- `GET /api/data-schedule/tasks/{taskId}/extract-result/drilldown/?fieldKey=...`
  - 按 fieldKey 路由到目标表查询

### 5.1 后端上下文解析链路（调整后）
1. 从任务上下文拿到 `file_prepare_project_id`（即当前调度任务关联的项目 ID）和 `industry`。  
2. 通过 `c_r_cm_kb_project_relation` 查映射：
   - 条件：`file_prepare_project_id = {步骤1的project_id}`
   - 取值：`c_r_cm_kb_project_relation.project_id`（下文称 `kb_project_id`）
3. 按 `industry` 选择 SW/JS 表，再使用 `kb_project_id` 作为业务表查询条件。  
4. 返回结构保持原接口契约不变（前端无感）。

## 6. 数据模型设计
- 只读关系表：`c_r_cm_kb_project_relation`
  - 关键字段：`file_prepare_project_id`、`project_id`（映射后的 `kb_project_id`）
- 只读业务表（SW/JS 对应表）
- 字段名优先列注释，空注释时回退列名。
- 排除创建时间/更新时间类字段。

### 6.1 关键主键语义
- `file_prepare_project_id`：任务侧/调度侧项目 ID（用于定位映射关系）。
- `kb_project_id`：`c_r_cm_kb_project_relation.project_id`，用于命中 SW/JS 行业业务表。

## 7. 状态与交互设计
- 初始：加载 detail + fields(all)
- 切换 scope：重拉 fields
- 点击查看：按 fieldKey 拉 drilldown

## 8. 复用与封装设计
- 抽取后端通用函数：
  - taskId -> project context 解析（含 `file_prepare_project_id` 与 `industry`）
  - `file_prepare_project_id -> kb_project_id` 映射解析（relation 查找）
  - 动态表字段元数据读取（含注释）
  - 动态 where 条件拼装

## 9. 文档计划
- 需求实现文档沉淀在当前目录。

## 10. MCP 与外部依赖
- 是否需要 MCP：否
- 数据库访问策略：遵循 `safe-sql-api-workflow`，本需求默认只读查询；若后续需要写库，需二次确认并补事务/回滚预案。

## 11. 测试方案
- 后端：编译校验 + 参数合法性校验
- 前端：typecheck + eslint

## 12. 风险
- 若线上表注释缺失，将回退为列名显示。
- 若 `c_r_cm_kb_project_relation` 无映射记录，将导致行业表无法命中；需提供空结果兜底和明确错误提示。
