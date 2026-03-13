# audit-project-workflow 技能说明

## 1. 作用
`audit-project-workflow` 是当前 audit 项目的专属 workflow skill，用来约束新线程中的默认协作方式，避免只靠当次对话记忆。

它主要负责提醒和约束以下事项：
- 默认使用中文回答与写文档
- 新需求先拆成 `requirement.md`、`design.md`、`tasks.md`
- 编码前必须先获得用户确认
- 前端可复用场景优先抽离组件、Hooks、Services
- 后端变更后补充前端可读文档，并沉淀到 `projects`
- 使用 MCP 前先说明用途、输入和预期输出

## 2. 技能位置
- 项目技能目录：`/Users/zyc/gxxm/audit/projects/skills-mcp/audit-project-workflow`

## 3. 依赖的项目内资料
该 skill 不重复存放知识库正文，而是引导代理优先读取项目内已有文档：
- `projects/_templates/`
- `projects/backend-knowledge-base/`
- `projects/skills-mcp/mcp-selection-guide.md`
- `projects/skills-mcp/mcp-installation-status.md`

## 4. 推荐使用方式

### 显式调用
```text
使用 $audit-project-workflow 处理这个需求
```

### 典型场景
- 新增前端/后端需求
- 需要先做设计再编码
- 需要补后端文档
- 需要沉淀项目级 skill 或 MCP 规范
- 需要判断该用哪个 MCP

## 5. 说明
- 该 skill 主要提供流程规则，不代替具体业务知识。
- 具体后端结构、接口契约和模板内容，仍以 `projects/` 目录下文档为准。
- 新线程是否能稳定遵守这些规则，优先依赖项目根目录 `AGENTS.md` 与该 skill 一起配合使用。
