# 设计文档

## 1. 概述
- 对应需求文档：`/Users/zyc/gxxm/audit/projects/integration-fast-loop-skill/requirement.md`
- 设计目标：提供可直接触发的“联调快循环沟通”skill，确保联调修复阶段沟通高频、结构化、可闭环。

## 2. 方案摘要
- 前端方案：无业务代码改动。
- 后端方案：无业务代码改动。
- 数据流转：仅新增项目文档与 skill 规范，无运行时数据流变化。

## 3. 架构与模块拆分
### 前端
- 页面/容器：不涉及。
- 可复用组件：不涉及。
- Hooks / Services：不涉及。

### 后端
- Django App：不涉及。
- Views / API：不涉及。
- Models：不涉及。
- Migrations：不涉及。

## 4. 文件规划
### 新增文件
- `/Users/zyc/gxxm/audit/projects/integration-fast-loop-skill/requirement.md`：需求背景与验收标准。
- `/Users/zyc/gxxm/audit/projects/integration-fast-loop-skill/design.md`：落地方案与文件规划。
- `/Users/zyc/gxxm/audit/projects/integration-fast-loop-skill/tasks.md`：执行清单与状态跟踪。
- `/Users/zyc/gxxm/audit/projects/skills-mcp/audit-integration-fast-loop/SKILL.md`：联调快循环流程定义。
- `/Users/zyc/gxxm/audit/projects/skills-mcp/audit-integration-fast-loop/agents/openai.yaml`：skill UI 元数据。

### 修改文件
- `/Users/zyc/gxxm/audit/projects/skills-mcp/audit-project-workflow-guide.md`：补充联调沟通配套 skill 入口。

## 5. 接口设计
- 接口地址：不涉及。
- 请求方法：不涉及。
- 请求参数：不涉及。
- 响应结构：不涉及。
- 异常处理：不涉及。

## 6. 数据模型设计
- 表/模型：不涉及。
- 字段：不涉及。
- 约束：不涉及。

## 7. 状态与交互设计
- 初始状态：需求进入联调修复阶段。
- 用户操作：显式调用 skill，按问题卡查看进展与阻塞。
- 边界场景：并行问题超过 3 个时，要求显式优先级和 WIP 限制，避免信息过载。

## 8. 复用与封装设计
- 需要抽离的组件：本次以 skill 作为复用单元。
- 需要抽离的公共工具：暂不需要脚本工具，先用文档化流程约束。
- 为什么需要封装：联调沟通属于跨需求的通用能力，适合沉淀为项目级 skill。

## 9. 文档计划
- 需要补充的后端文档：无。
- 需要新增的功能文档：新增联调快循环需求/设计/任务文档。
- 面向前端同学的说明：skill 输出模板直接可读，重点关注“当前阻塞与待确认决策”。

## 10. MCP 与外部依赖
- 是否需要 MCP：否。
- 使用目的：不涉及。
- 预期输入/输出：不涉及。

## 11. 测试方案
- 前端验证：不涉及业务代码验证。
- 后端验证：不涉及业务代码验证。
- 手工验证：检查 skill 文件结构、触发描述、默认提示词和项目指南引用是否一致。

## 12. 风险
- 技术风险：低，主要是规则表述是否过重。
- 回滚/兜底方案：若后续不适用，可删除该 skill 入口并回退到 `audit-project-workflow` 通用模式。

