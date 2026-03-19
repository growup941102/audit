# 设计文档

## 1. 概述
- 对应需求文档：
  `projects/data-query-drilldown-view/requirement.md`
- 设计目标：
  让 DataQuery 三类字段“查看”可点击，并在弹层内展示与 ScheduleDetailView 下钻一致的明细内容，同时不影响 ScheduleDetailView 的增删改行为。

## 2. 方案摘要
- 前端方案：
  在 DataQuery 列表识别三类字段并渲染“查看”按钮；点击后打开下钻弹层，加载对应明细数据。
- 后端方案：
  提供 DataQuery 可用的下钻明细接口（若不可直接复用现有 DataSchedule 接口），返回标准化列定义、记录、分页和只读动作标记。
- 数据流转：
  DataQuery 行数据（projectId + industry + fieldKey） -> 请求下钻接口 -> 返回 columns/records -> 弹层展示。

## 3. 架构与模块拆分
### 前端
- 页面/容器：
  - `data-query/index.tsx`：管理查看弹层开关和参数。
- 可复用组件：
  - 新增 `DataQueryDrilldownModal`（建议）。
- Hooks / Services：
  - 新增 `useDataQueryDrilldown`。
  - 新增 `fetchDataQueryDrilldown` API 方法。

### 后端
- Django App：
  - `backend/api`
- Views / API：
  - 新增 data-query drilldown 查询接口（GET）。
- Models：
  - 无新增模型。
- Migrations：
  - 无。

## 4. 文件规划
### 新增文件
- `frontend/src/pages/(base)/data-fetch/data-query/modules/DataQueryDrilldownModal.tsx`：下钻明细弹层。
- `frontend/src/service/hooks/useDataQuery.ts`（扩展）：新增 drilldown hook。
- `frontend/src/service/api/data-query.ts`（扩展）：新增 drilldown API 调用。
- `frontend/src/service/urls/data-query.ts`（扩展）：新增 drilldown URL。
- `frontend/src/service/types/data-query.d.ts`（扩展）：新增 drilldown 类型。

### 修改文件
- `frontend/src/pages/(base)/data-fetch/data-query/modules/DataQueryTable.tsx`：三类字段渲染可点击“查看”。
- `frontend/src/pages/(base)/data-fetch/data-query/index.tsx`：管理“查看”触发与弹层状态。
- `backend/api/views.py`：新增/补齐 data-query drilldown 接口与查询逻辑。
- `backend/api/urls.py`：注册新接口路由。

## 5. 接口设计
- 接口地址（建议）：
  `/api/data-query/drilldown/`
- 请求方法：
  `GET`
- 请求参数（建议）：
  - `projectId`：项目ID（必填）
  - `industry`：行业（必填）
  - `fieldKey`：`tender_agent_info | expert_info | opening_attendee_info`（必填）
  - `current`：页码（可选）
  - `size`：每页条数（可选）
- 响应结构（建议）：
  - `title`
  - `fieldKey`
  - `columns`（key/title/width/editable）
  - `records`
  - `current/size/total`
  - `actions`（DataQuery 场景建议只读：`canCreate/canEdit/canDelete=false`）
- 异常处理：
  - 参数错误 400
  - 数据不存在 404
  - 数据源错误 500（统一错误文案）

## 6. 数据模型设计
- 表/模型：
  复用既有明细来源表（招标代理机构、专家、开标人员相关表）。
- 字段：
  按现有下钻字段映射返回，不新增持久化字段。
- 约束：
  只读查询，不写入。

## 7. 状态与交互设计
- 初始状态：
  列表正常展示，“查看”可点。
- 用户操作：
  点击“查看” -> 打开弹层 -> 加载数据 -> 展示结果。
- 边界场景：
  - 缺少 fieldKey/projectId：提示并不打开弹层。
  - 接口返回空：弹层空态。
  - 接口错误：提示错误并允许关闭。

## 8. 复用与封装设计
- 需要抽离的组件：
  `DataQueryDrilldownModal`。
- 需要抽离的公共工具：
  字段 key 映射工具（字段名 -> fieldKey）。
- 为什么需要封装：
  避免 DataQuery 与 DataSchedule 重复堆叠逻辑，后续便于统一维护。

## 9. 文档计划
- 需要补充的后端文档：
  data-query drilldown 接口参数与响应说明。
- 需要新增的功能文档：
  DataQuery“查看”交互说明。
- 面向前端同学的说明：
  三类字段的识别规则、点击行为、异常兜底策略。

## 10. MCP 与外部依赖
- 是否需要 MCP：
  否（当前实现可在仓库内完成）。
- 使用目的：
  无。
- 预期输入/输出：
  无。

## 11. 测试方案
- 前端验证：
  - 三列“查看”可点击。
  - 弹层加载、关闭、空态、异常态可用。
- 后端验证：
  - 接口参数校验。
  - 三类 fieldKey 正确返回列与数据。
- 手工验证：
  用 SW/JS 各选一条项目验证三类字段行为。

## 12. 风险
- 技术风险：
  DataQuery 场景缺少 taskId，可能导致无法直接复用现有 DataSchedule 下钻函数。
- 回滚/兜底方案：
  若联调受阻，先保留“查看”按钮与提示文案，不中断原列表功能。
