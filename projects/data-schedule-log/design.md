# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-schedule-log/requirement.md`
- 设计目标：实现“数据调度日志”弹窗界面，支持级别筛选、时间排序、按条数查询与导出。

## 2. 方案摘要
- 前端方案：
  - 在 `data-schedule/index.tsx` 的“执行日志”菜单项中打开日志弹窗；
  - 日志弹窗按“头部信息 + 筛选区 + 表格区”拆分；
  - 使用 service/hooks 请求日志元信息、日志列表、日志导出接口。
- 后端方案：
  - 在 `backend/api/views.py` 增加日志相关 3 个接口；
  - 列表接口支持 `level/orderBy/orderDirection/startTime/endTime/keyword/count`；
  - 默认返回最近 `100` 条日志；
  - 导出接口按当前过滤条件输出 xlsx。
- 数据流转：
  1. 打开弹窗 -> 拉取日志元信息 + 默认最近 100 条日志；
  2. 用户筛选/排序 -> 携带参数重拉日志列表；
  3. 用户点击刷新 -> 以当前筛选条件重新查询；
  4. 用户点击导出 -> 传当前筛选参数下载日志文件。

## 3. 架构与模块拆分
### 前端
- 页面/容器：
  - `data-schedule/index.tsx`（挂载日志弹窗）
- 可复用组件：
  - `ScheduleLogModal`：日志弹窗主容器
  - `ScheduleLogFilters`：筛选区
  - `ScheduleLogTable`：日志表格
- Hooks / Services：
  - `service/urls/data-schedule.ts`：补日志 URL
  - `service/api/data-schedule.ts`：补日志 API
  - `service/hooks/useDataSchedule.ts`：补日志 hooks
  - `service/types/data-schedule.d.ts`：补日志类型

### 后端
- Django App：`backend/api`
- Views / API：`views.py` 新增日志元信息/列表/导出函数
- Models：本期不新增模型（先使用可替换数据源）
- Migrations：本期无

## 4. 文件规划
### 新增文件
- 无强制新增（优先复用现有 `data-schedule` service/types/hook 文件追加日志能力）。

### 修改文件
- `frontend/src/pages/(base)/data-fetch/data-schedule/index.tsx`：绑定“执行日志”打开弹窗。
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/`：新增日志弹窗组件。
- `frontend/src/service/urls/data-schedule.ts`：补日志接口常量。
- `frontend/src/service/api/data-schedule.ts`：补日志查询/导出 API。
- `frontend/src/service/hooks/useDataSchedule.ts`：补日志查询 hooks。
- `frontend/src/service/types/data-schedule.d.ts`：补日志 DTO 类型。
- `frontend/src/locales/langs/zh-cn/page.ts`、`en-us/page.ts`：补日志文案。
- `frontend/src/types/app.d.ts`：补日志 i18n 类型。
- `backend/api/views.py`：新增日志接口实现。
- `backend/api/urls.py`：挂载日志接口路由。

## 5. 接口设计

### 5.1 获取日志元信息
- 接口地址：`GET /api/data-schedule/tasks/{task_id}/logs/meta/`
- 请求方法：GET
- 请求参数：无
- 响应结构：
  - `taskId`
  - `projectName`
  - `serviceName`
  - `nodeName`
- 异常处理：任务不存在返回 `1004`。

### 5.2 获取日志列表
- 接口地址：`GET /api/data-schedule/tasks/{task_id}/logs/`
- 请求方法：GET
- 请求参数：
  - `level`: `info | warn | error`（可选）
  - `keyword`: string（可选）
  - `startTime`: `YYYY-MM-DD HH:mm:ss`（可选）
  - `endTime`: `YYYY-MM-DD HH:mm:ss`（可选）
  - `orderBy`: 固定 `time`（默认 `time`）
  - `orderDirection`: `asc | desc`（默认 `desc`）
  - `count`: number（默认 `100`，最大 `1000`）
- 响应结构：
  - `count/total`
  - `records[]`：
    - `id`
    - `time`
    - `component`
    - `level`（`info/warn/error`）
    - `message`
- 异常处理：
  - 参数非法返回 `1001`；
  - 任务不存在返回 `1004`。

### 5.3 导出日志
- 接口地址：`GET /api/data-schedule/tasks/{task_id}/logs/export/`
- 请求方法：GET
- 请求参数：同日志列表筛选参数（包含 `count`）
- 响应结构：`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- 异常处理：导出失败返回统一错误响应。

## 6. 数据模型设计
- 本期不新增数据库表，先使用可替换日志数据源结构：
  - `task_meta`: 任务日志头部信息
  - `task_logs`: 日志记录列表
- 日志记录字段约束：
  - `level ∈ {info,warn,error}`
  - `time` 为可排序时间字段
  - `message` 为文本字段，支持关键字匹配

## 7. 状态与交互设计
- 初始状态：打开弹窗后默认 `orderBy=time&orderDirection=desc&count=100` 查询。
- 用户操作：
  - 切换日志级别 -> 按当前 count 重新查询；
  - 调整时间范围/关键字 -> 查询；
  - 切换排序方向 -> 查询；
  - 修改条数（count） -> 查询；
  - 点击刷新 -> 按当前条件刷新；
  - 点击导出 -> 导出当前筛选日志。
- 边界场景：
  - 无日志：显示空态；
  - 请求失败：提示错误；
  - 导出失败：提示失败，不影响当前列表。

## 8. 复用与封装设计
- 需要抽离的组件：
  - 日志弹窗、筛选区、日志表格。
- 需要抽离的公共工具：
  - 导出文件下载工具（若现有工具可复用则直接复用）。
- 为什么需要封装：
  - 日志交互复杂度高（筛选、排序、按条数查询、导出），拆分后更利于维护与复用。

## 9. 文档计划
- 需要补充的后端文档：
  - 在本需求下补充日志接口参数说明与返回示例。
- 需要新增的功能文档：
  - `projects/data-schedule-log/` 三份文档。
- 面向前端同学的说明：
  - `level` 仅允许 `info/warn/error`；
  - `orderBy` 当前固定 `time`；
  - `count` 默认 `100`，用于“最近 N 条”查询；
  - 导出参数与查询参数保持一致。

## 10. MCP 与外部依赖
- 是否需要 MCP：否
- 使用目的：无
- 预期输入/输出：无

## 11. 测试方案
- 前端验证：
  - 弹窗打开/关闭；
  - 筛选、排序、刷新、按条数查询；
  - 导出触发与下载结果。
- 后端验证：
  - 元信息接口、列表接口、导出接口参数校验；
  - `level`、`orderDirection` 非法值校验；
  - `count` 边界值校验（默认值/超上限）；
  - 导出文件内容字段完整性。
- 手工验证：
  - 从列表页“更多 -> 执行日志”进入；
  - 默认应查询最近 100 条日志；
  - 执行筛选后导出并核对导出内容。

## 12. 风险
- 技术风险：
  - 日志量较大时导出耗时可能较长；
  - 后续真实日志源切换时字段映射可能需要调整。
- 回滚/兜底方案：
  - 导出失败时保留列表可用；
  - 如接口异常，可临时降级为只读日志列表（不导出）。
