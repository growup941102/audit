# 设计文档

## 接口设计
统一提供动作入口，避免多接口重复校验：
- `POST /api/data-schedule/tasks/actions/`

请求体：
- `action`: `reExecute | continue | pause | stop | delete | refresh`
- `taskIds`: `string[]`（refresh 可不传）

响应体：
- `action`
- `requested`
- `updated`
- `deleted`
- `invalidTaskIds`
- `message`

## 动作语义（结合 5.5）
- `reExecute`：将目标任务置为 `PENDING`，清空锁与错误，`attempt_count=0`，`available_at=NOW()`。
- `continue`：对 `PAUSED/STOPPED/CANCELLED/FAILED/PARTIAL_FAILED` 置为 `PENDING`，清空锁与错误。
- `pause`：将 `PENDING/CLAIMED/RUNNING` 置为 `PAUSED`。
- `stop`：将 `PENDING/CLAIMED/RUNNING/PAUSED` 置为 `CANCELLED`。
- `delete`：按 `resource_id` 删除项目级任务记录（幂等）。
- `refresh`：不改业务状态，仅返回当前时间与任务汇总（可扩展为调度配置刷新）。

## 安全策略
- 先查后改：先校验 taskIds 对应的记录存在且是项目级任务。
- 所有写操作都在事务中执行。
- 动作白名单校验，非法 action 直接 400。
- 批量上限控制（默认 200，避免一次性写过多）。

## 前端接入
- 数据调度页批量按钮调用动作接口。
- 行内删除菜单调用动作接口（action=delete, taskIds=[taskId]）。
- 成功后刷新列表；失败展示后端错误信息。
