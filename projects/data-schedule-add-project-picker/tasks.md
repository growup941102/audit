# 任务文档

## 1. 准备阶段
- [x] 完成 `requirement.md`
- [x] 完成 `design.md`
- [x] 编码前获得用户确认（当前需求已在会话中明确授权）

## 2. 前端任务
- [x] 重构 `ScheduleChooseDataModal` 为搜索 + 单选列表。
- [x] 重构 `ScheduleCreateView` 选择状态为单项目。
- [x] 同步 `chooseDataMock.ts` 与 `data-schedule.d.ts` 类型。
- [x] 补充/更新页面提示文案（空态、已选摘要）。
- [x] 接入“创建”按钮调用 `/admin/retry` 并传 `projectIds`。
- [x] 增加开发代理配置，将 retry 请求转发到 `10.1.221.233:9528`。

## 3. 后端任务
- [x] 先补失败测试：`select-data` 新 payload 与筛选规则。
- [x] 重写 `select-data` 查询与 payload 组装（只读 SQL）。
- [x] 保持接口地址与鉴权不变。

## 4. 联调任务
- [x] 对齐前后端请求与响应契约（`projects` 列表）。
- [x] 确认无额外权限/鉴权影响。
- [x] 确认仅只读查库，无写操作。
- [x] 对齐创建接口参数契约（`projectIds` + 固定字段）。

## 5. 验证
- [x] 执行后端目标测试并确认红绿过程。
- [x] 执行前端 typecheck。
- [ ] 进行手工流程验证（新增弹窗搜索+单选）。
- [ ] 进行手工代理验证（确认命中 `/proxy-retryAdmin/admin/retry`）。

## 6. 交付
- [ ] 总结变更文件及其用途。
- [ ] 总结验证结果。
- [ ] 记录风险与后续建议。
