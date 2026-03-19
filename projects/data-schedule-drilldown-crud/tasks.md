# 任务文档

## 1. 准备阶段
- [x] 理解 `ScheduleDetailView` 不可点击根因
- [x] 明确 TDD + safe-sql 约束

## 2. 后端任务
- [x] TDD-RED：新增字段 locator 兜底失败测试
- [x] TDD-RED：新增 drilldown CRUD 能力失败测试
- [x] TDD-GREEN：实现 locator 兜底逻辑
- [x] TDD-GREEN：实现 drilldown actions 动态开关
- [x] TDD-GREEN：实现 drilldown create/update/delete 落库 helper
- [x] TDD-GREEN：API 接入落库 helper

## 3. 前端任务
- [x] 调整下钻新增/编辑弹窗仅渲染可编辑列
- [x] 调整按钮禁用条件，避免被只读列误伤

## 4. 验证
- [x] 后端测试通过
- [x] 前端 eslint/typecheck 通过
- [ ] 页面手工回归（真实环境点击验证）
