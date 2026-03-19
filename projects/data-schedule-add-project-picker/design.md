# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-schedule-add-project-picker/requirement.md`
- 设计目标：重做新增弹窗为项目单选，并保证后端项目筛选规则准确可测。

## 2. 方案摘要
- 前端方案：
  - `ScheduleChooseDataModal` 改为搜索输入 + radio 列表。
  - `ScheduleCreateView` 维护“已确认选择”与“弹窗草稿选择”两套单选状态。
  - `DataSchedule` 页将“创建”事件接入 `/admin/retry`，按单选结果组装 `projectIds`。
  - 通过 Vite 前端代理（`retryAdmin`）将请求转发到 `10.1.221.233:9528`。
- 后端方案：
  - `GET /api/data-schedule/select-data/` 改为返回 `projects` 列表：`projectId/projectName/industry`。
  - 查询条件沿用有效项目约束 + 新增反向规则。
- 数据流转：
  - 页面打开 -> 拉取 `select-data` -> 弹窗本地搜索 -> 单选确认 -> 页面显示已选项目摘要 -> 点击创建调用 `/admin/retry`。

## 3. 架构与模块拆分
### 前端
- 页面/容器：`ScheduleCreateView`
- 可复用组件：`ScheduleChooseDataModal`
- Hooks / Services：沿用 `useDataScheduleSelectData`
  - API：新增 `createDataScheduleTasksByRetry`

### 后端
- Django App：`backend/api`
- Views / API：`_fetch_data_schedule_select_data_projects`、`_build_data_schedule_select_data_payload`
- Models：无新增
- Migrations：无

## 4. 文件规划
### 新增文件
- `projects/data-schedule-add-project-picker/requirement.md`：需求定义。
- `projects/data-schedule-add-project-picker/design.md`：方案设计。
- `projects/data-schedule-add-project-picker/tasks.md`：任务拆解。

### 修改文件
- `backend/api/views.py`：重写 select-data 组装逻辑。
- `backend/api/tests/test_data_schedule_scope_rules.py`：先新增失败测试，再补实现。
- `frontend/src/service/types/data-schedule.d.ts`：同步新的 `SelectDataPayload` 类型。
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/ScheduleChooseDataModal.tsx`：弹窗 UI 与交互重构。
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/ScheduleCreateView.tsx`：状态模型切换为项目单选。
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/chooseDataMock.ts`：类型定义改为项目选项。
- `frontend/src/pages/(base)/data-fetch/data-schedule/index.tsx`：创建事件改为调用 retry API。
- `frontend/src/service/api/data-schedule.ts`：新增 retry 创建接口封装。
- `frontend/src/service/urls/data-schedule.ts`：新增 `ADMIN_RETRY` 路径常量。
- `frontend/.env.test`：增加 `retryAdmin` 代理目标地址。
- `frontend/src/types/app.d.ts`：扩展 `OtherBaseURLKey`。

## 5. 接口设计
- 接口地址：`GET /api/data-schedule/select-data/`
- 请求方法：`GET`
- 请求参数：无
- 响应结构：
  - `projects: Array<{ projectId: string; projectName: string; industry: string }>`
- 异常处理：沿用现有错误包装。
- 外部创建接口：
  - 接口地址：`POST /admin/retry`（经前端代理）
  - 请求体：`{stepNo,subStep,projectIds,fileIds,priority,preempt,force,onlyStep,mode,payload}`
  - 说明：`projectIds` 由当前弹窗选中项目注入，其它字段按约定固定值传递。

## 6. 数据模型设计
- 表/模型：
  - `c_r_cm_project p`
  - `c_r_cm_file_prepare f`
  - `c_r_cm_task_item_queue q`
- 约束：
  - `p.project_id` 非空
  - `p.industry` 非空
  - 逻辑删除字段（若存在）需为未删除
  - 命中新增反向规则

## 7. 状态与交互设计
- 初始状态：未选择项目。
- 用户操作：打开弹窗 -> 搜索 -> 选择单项目 -> 确认。
- 边界场景：
  - 接口返回空列表。
  - 搜索后无匹配。
  - 接口异常。

## 8. 复用与封装设计
- 需要抽离的组件：继续复用 `ScheduleChooseDataModal`，仅替换内部结构。
- 需要抽离的公共工具：`matchProjectKeyword`（可内联，保持轻量）。
- 为什么需要封装：页面专注状态，弹窗专注展现与选择。

## 9. 文档计划
- 需要补充的后端文档：本需求三件套已覆盖接口变更。
- 需要新增的功能文档：同目录下 requirement/design/tasks。
- 面向前端同学的说明：接口响应字段从树结构改为项目列表。

## 10. MCP 与外部依赖
- 是否需要 MCP：否。
- 使用目的：无。
- 预期输入/输出：无。

## 11. 测试方案
- 前端验证：`pnpm typecheck` 覆盖类型与组件调用。
- 后端验证：`python manage.py test api.tests.test_data_schedule_scope_rules`。
- 手工验证：新增页打开弹窗，搜索并单选项目，确认后摘要更新。
  - 手工验证补充：点击“创建”后，Network 应看到 `/proxy-retryAdmin/admin/retry` 请求，body 中 `projectIds` 与当前选择一致。

## 12. 风险
- 技术风险：历史树结构类型变更可能影响旧调用。
- 回滚/兜底方案：
  - 若代理未配置，前端直接提示配置错误并阻断创建。
  - 若出现前端兼容问题，可在后端 payload 临时保留旧字段并前端忽略。
