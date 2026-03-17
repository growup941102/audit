# 任务文档

## 1. 准备阶段
- [x] 明确移除 mock 与日志化的范围
- [x] 完成 `requirement.md`
- [x] 完成 `design.md`

## 2. 前端任务
- [x] data-schedule 列表 mock 改为显式报错
- [x] 选择数据目录 mock 改为空数据源
- [x] 新建调度页提示“真实源未接入直接报错”
- [x] 数据概览排名去掉占位补齐
- [x] 数据概览请求失败时直接抛错

## 3. 后端任务
- [x] data-schedule mock 兜底入口改为显式抛错
- [x] 新增 API 失败日志中间件
- [x] settings 注册失败日志中间件
- [x] 新增失败日志查询接口 `/api/admin/logs/api-failures/`

## 4. 文档任务
- [x] 新增 `ai-audit-agent-reference.md`
- [x] 更新 backend knowledge base 索引
- [x] 更新前后端契约文档（补日志接口）

## 5. 验证
- [x] 后端 `py_compile` 通过
- [x] 后端 `manage.py check` 通过
- [ ] 前端类型检查（当前环境无 node/npm/pnpm）

## 6. 交付
- [x] 改动结果整理
- [x] 风险与未完成项说明
- [ ] 等待下一步指令
