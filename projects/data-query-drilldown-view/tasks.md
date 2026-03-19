# 任务文档

## 1. 准备阶段
- [x] 完成 `requirement.md`
- [x] 完成 `design.md`
- [ ] 编码前获得用户确认

## 2. 前端任务
- [ ] 判断是否需要抽离复用组件（`DataQueryDrilldownModal`）
- [ ] 实现 `DataQueryTable` 三列“查看”按钮点击事件
- [ ] 实现 `data-query/index.tsx` 弹层状态管理
- [ ] 实现 `service/api/hooks/types` 的 drilldown 查询能力
- [ ] 补充前端交互说明（字段识别与异常兜底）

## 3. 后端任务
- [ ] 实现 DataQuery 下钻查询 API（只读）
- [ ] 在 `urls.py` 注册接口路由
- [ ] 复用/封装现有下钻查询逻辑，输出统一结构
- [ ] 补充后端接口文档（给前端可读）

## 4. 联调任务
- [ ] 对齐请求参数：`projectId/industry/fieldKey/current/size`
- [ ] 对齐响应结构：`title/columns/records/actions/pagination`
- [ ] 对齐异常码与文案

## 5. 验证
- [ ] 执行前端构建/类型检查（按项目可用命令）
- [ ] 执行后端接口自测（参数错误/正常/空数据）
- [ ] 手工回归：三列点击查看 + 弹层关闭 + 异常提示

## 6. 交付
- [ ] 总结变更文件及用途
- [ ] 总结验证结果与已知限制
- [ ] 等待下一步指令
