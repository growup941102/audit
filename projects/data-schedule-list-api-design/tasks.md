# 任务文档

## 1. 准备阶段
- [x] 完成 `requirement.md`
- [x] 完成 `design.md`
- [x] 对齐当前页面搜索条件与参数语义

## 2. 后端任务（实现阶段）
- [x] 新增 `GET /api/data-schedule/tasks/` 路由
- [x] 新增参数解析与校验逻辑
- [x] 新增列表聚合查询函数（复用核心表）
- [x] 新增基准集合门禁（industry 非空 + 存在 file_prepare + 存在项目级队列）
- [x] 新增状态映射与进度计算逻辑
- [x] 返回分页结构并补充 swagger 注释

## 3. 前端任务（实现阶段）
- [x] 将 `fetchScheduleList` 从 mock 切换为真实 API
- [x] 在请求层将 `createTime` 映射为 `createStartTime/createEndTime`
- [x] 透传多选 `taskStatus/creator`

## 4. 验证
- [ ] 参数合法性与异常分支验证
- [ ] 多条件组合筛选验证
- [ ] 分页与排序验证
- [ ] 验证无 `file_prepare`/无队列项目不会展示
- [ ] 与数据概览任务状态口径做抽样对比

## 5. 交付
- [ ] 输出实现清单与联调说明
- [ ] 更新后端知识库页面接口索引
- [ ] 等待下一步指令
