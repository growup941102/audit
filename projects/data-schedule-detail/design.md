# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-schedule-detail/requirement.md`
- 设计目标：实现“数据调度详情”完整查询与下钻链路，提供三态筛选和可下钻的 Excel 下载。

## 2. 方案摘要
- 前端方案：
  - 在 `data-schedule` 下新增详情页（建议路由：`/data-fetch/data-schedule/detail/:taskId`）；
  - 页面拆分：概览区、三态切换、主表、下钻弹窗；
  - 数据通过 service API 获取，不再依赖页面 mock。
- 后端方案：
  - 在 `backend/api` 新增数据调度详情相关接口；
  - 统一使用 `success_response / error_response` 返回结构；
  - 下载接口返回 xlsx 文件流，支持 Sheet 下钻。
- 数据流转：
  1. 进入详情页 -> 拉取任务概览；
  2. 默认拉取 `scope=all` 字段列表；
  3. 切换 scope 后带参数重拉列表；
  4. 点击“查看”按字段 key 拉取下钻；
  5. 点击下载按当前 scope 导出。

## 3. 架构与模块拆分
### 前端
- 页面/容器：
  - `data-schedule/detail/[taskId].tsx`（详情页容器）
- 可复用组件：
  - `TaskSummaryCard`（任务概览卡）
  - `DetailScopeTabs`（全部/完整/缺失）
  - `DetailFieldTable`（主表）
  - `DrilldownModal`（下钻弹窗）
- Hooks / Services：
  - `service/api/data-schedule.ts`
  - `service/hooks/useDataSchedule.ts`
  - `service/types/data-schedule.d.ts`

### 后端
- Django App：`backend/api`
- Views / API：在 `views.py` 增加数据调度详情相关函数视图
- Models：本期优先不改模型（接口契约优先，可使用可替换数据源）
- Migrations：本期无

## 4. 文件规划
### 新增文件
- `frontend/src/pages/(base)/data-fetch/data-schedule/detail/[taskId].tsx`：详情主页面
- `frontend/src/pages/(base)/data-fetch/data-schedule/detail/modules/*.tsx`：详情子组件
- `frontend/src/service/api/data-schedule.ts`：数据调度详情接口封装
- `frontend/src/service/hooks/useDataSchedule.ts`：React Query hooks
- `frontend/src/service/types/data-schedule.d.ts`：接口类型定义
- `frontend/src/service/urls/data-schedule.ts`：接口 URL 常量

### 修改文件
- `frontend/src/pages/(base)/data-fetch/data-schedule/index.tsx`：接入跳转详情
- `frontend/src/service/api/index.ts`：导出 data-schedule API
- `frontend/src/service/hooks/index.ts`：导出 data-schedule hooks
- `frontend/src/service/urls/index.ts`：导出 data-schedule URLs
- `frontend/src/service/keys/index.ts`：新增 query key
- `frontend/src/locales/langs/zh-cn/page.ts`、`en-us/page.ts`：补充详情文案
- `frontend/src/types/app.d.ts`：补充 i18n 类型
- `backend/api/urls.py`：挂载新接口
- `backend/api/views.py`：实现新接口

## 5. 接口设计

### 5.1 获取任务提取结果概览
- 接口地址：`GET /api/data-schedule/tasks/{task_id}/extract-result/summary/`
- 请求参数：无
- 响应结构：
  - `taskId`
  - `projectName`
  - `bidNo`
  - `creator`
  - `createTime`
  - `status`
  - `progress`
  - `counts`：`all` / `complete` / `missing`

### 5.2 获取字段结果列表（支持三态）
- 接口地址：`GET /api/data-schedule/tasks/{task_id}/extract-result/fields/`
- 请求参数：
  - `scope`: `all | complete | missing`（默认 `all`）
  - `current`: number（默认 1）
  - `size`: number（默认 20）
- 响应结构：分页结构
  - `records[]`：
    - `fieldKey`
    - `fieldName`
    - `fieldValueDisplay`
    - `status`: `complete | missing`
    - `canDrilldown`: boolean
    - `drilldownLabel`: string（如“查看”）
    - `canEdit`: boolean

### 5.3 获取字段下钻明细（detail2/detail3）
- 接口地址：`GET /api/data-schedule/tasks/{task_id}/extract-result/drilldown/`
- 请求参数：
  - `fieldKey`: string（必填）
  - `scope`: `all | complete | missing`（可选，默认 `all`）
  - `current`: number（默认 1）
  - `size`: number（默认 20）
- 响应结构：
  - `title`: string（如“字段详情 - 评标专家信息”）
  - `columns[]`: `{ key, title, width?, editable? }`
  - `records[]`: 动态行数据（键与 `columns.key` 对齐）
  - `actions`: `{ canCreate, canEdit, canDelete }`

> 说明：不同 `fieldKey` 返回不同 `columns` 与 `records`，满足“不同查看点击展示内容不一样”。

### 5.4 下载提取结果（支持下钻）
- 接口地址：`GET /api/data-schedule/tasks/{task_id}/extract-result/export/`
- 请求参数：
  - `scope`: `all | complete | missing`（默认 `all`）
- 响应：`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- 文件组织建议：
  - Sheet1：`任务概览`
  - Sheet2：`字段详情_{scope}`
  - Sheet3+：每个可下钻字段一个 Sheet（如 `字段详情_评标专家信息`）
- 下钻实现建议：
  - 在 `字段详情` Sheet 的“字段内容”单元格写入超链接，跳转到对应下钻 Sheet。

## 6. 数据模型设计
- 本期不强制落库；接口层先按统一 DTO 输出。
- 后续若落库，建议实体：
  - `schedule_task`
  - `schedule_extract_field`
  - `schedule_extract_drilldown_row`

## 7. 状态与交互设计
- 初始状态：加载 summary + fields(all)
- 用户操作：
  - 切换三态 -> 重拉 fields
  - 点击查看 -> 打开下钻弹窗并拉取 drilldown
  - 点击下载 -> 请求 export
- 边界场景：
  - 无数据 -> 空态
  - 接口失败 -> 错误提示
  - 下钻无数据 -> 弹窗空态

## 8. 复用与封装设计
- 需要抽离的组件：详情主卡、筛选按钮组、字段表、下钻弹窗。
- 需要抽离的公共工具：导出文件下载工具（若已有则复用）。
- 为什么需要封装：详情页信息密度高，拆分后便于维护和后续接入真实数据。

## 9. 文档计划
- 需要补充的后端文档：新增数据调度详情 API 说明。
- 需要新增的功能文档：本目录三份文档。
- 面向前端同学的说明：
  - `scope` 参数语义
  - `fieldKey` 驱动下钻动态列
  - excel 下钻机制。

## 10. MCP 与外部依赖
- 是否需要 MCP：否
- 使用目的：无
- 预期输入/输出：无
- Excel 生成库选型：
  - 选型：`openpyxl>=3.1.5`
  - 选型原因：
    - 同时支持 xlsx 读写，便于后续模板化改造；
    - 支持工作簿内超链接（可实现字段详情 -> 下钻 Sheet 跳转）；
    - 在 Django 导出场景中实现成本低、可维护性更好。
  - 备选：`xlsxwriter`（写入性能更强，但不支持读取/修改既有文件）。

## 11. 测试方案
- 前端验证：
  - 详情页加载、三态切换、下钻弹窗、下载按钮；
  - 不同 `fieldKey` 的下钻列结构差异。
- 后端验证：
  - 4 个接口参数校验与返回结构；
  - 下载文件内容和超链接有效性。
- 手工验证：
  - 按截图流程走查：detail -> 查看 -> detail3。

## 12. 风险
- 技术风险：xlsx 生成与超链接处理复杂度较高。
- 回滚/兜底方案：
  - 下载接口先返回无下钻版本（兜底），后续增量补下钻；
  - 下钻接口异常时弹窗显示空态+提示。
