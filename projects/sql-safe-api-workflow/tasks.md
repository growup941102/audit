# 任务文档

## 1. 准备阶段
- [x] 完成 `requirement.md`
- [x] 完成 `design.md`
- [x] 与用户确认核心强制规则

## 2. Skill 沉淀任务
- [x] 新增 `safe-sql-api-workflow/SKILL.md`
- [x] 写入“默认只读”硬门禁
- [x] 写入“写操作二次确认”硬门禁
- [x] 写入“先测试库，后生产”硬门禁
- [x] 写入“事务 + 回滚预案”硬门禁
- [x] 写入“先 SELECT 验证命中范围”硬门禁
- [x] 写入“联调前后记录字段”硬门禁
- [x] 补充 Python 对齐 Java 读取 Nacos 的执行建议

## 3. 联调治理任务
- [x] 明确联调记录最小字段：
  - `request_params`
  - `expected_affected_rows`
  - `actual_affected_rows`
  - `rollback_point`
- [x] 明确未满足门禁时的处理：停止执行写入并回到确认阶段

## 4. 验证
- [x] 文档自检：规则完整性
- [x] 文档自检：流程可执行性
- [ ] 选取一个真实接口补齐任务做流程试跑（待你下一步指令）

## 5. 交付
- [x] 完成项目文档沉淀
- [x] 完成 skill 初版落地
- [ ] 等待你确认后进入具体接口实现阶段
