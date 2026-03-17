# 任务文档

## 1. 准备阶段
- [x] 完成 `requirement.md`
- [x] 完成 `design.md`
- [x] 明确参考来源：`gxxm/ai-audit-agent` 状态接口与 SQL 口径

## 2. 后端任务
- [x] 新增项目状态聚合查询函数（只读 SQL）
- [x] 新增 `summary` 接口
- [x] 新增 `project status` 接口
- [x] 新增 `ranking` 接口
- [x] 路由注册到 `backend/api/urls.py`
- [x] 数据库环境变量别名兼容调整

## 3. 前端任务
- [x] 新增 `data-overview` 的 `urls/api/hooks/types`
- [x] 更新 `QUERY_KEYS`
- [x] `KpiCards` 改为接口数据
- [x] `TaskRanking` 改为接口数据
- [x] 导出入口 `service/api/index.ts`、`service/hooks/index.ts`、`service/urls/index.ts` 更新

## 4. 联调任务
- [ ] 验证 summary 与页面 KPI 映射正确
- [ ] 验证 ranking 分类映射与 Top20 展示
- [ ] 验证日期筛选请求参数与结果变化
- [ ] 验证 `projectId` 不存在时返回 404

## 5. 验证
- [x] 后端基础检查（语法/导入）
- [ ] 前端基础检查（类型/构建）
- [ ] 记录未覆盖的风险项

## 6. 交付
- [ ] 总结变更文件与职责
- [ ] 总结验证结果
- [ ] 等待下一步指令
