---
name: audit-project-workflow
description: 项目专属研发协作工作流。用于在 `/Users/zyc/gxxm/audit` 仓库中处理前后端需求、后端文档补充、接口联调、skill/MCP 沉淀和需求拆解时，统一执行以下规范：优先使用中文回答与写文档；先整理 `requirement.md`、`design.md`、`tasks.md`；编码前先获得用户确认；前端可复用场景优先抽组件、Hooks、Services；后端改动后同步补充前端可读文档并沉淀到 `projects`；需要 MCP 时先说明用途、输入和预期输出。仅在当前 audit 项目或包含同等目录结构时使用。
---

# Audit Project Workflow

在当前 audit 项目中执行需求、设计、开发、联调和文档沉淀时，先按本 skill 的流程工作，再进入具体实现。

## 0. 先确认适用范围

仅在以下条件满足时使用本 skill：
- 工作区是 `/Users/zyc/gxxm/audit`
- 仓库内存在 `frontend/`、`backend/`、`projects/` 目录

如果当前仓库不满足这些条件，说明本 skill 不适用，应先说明原因，不要强行套用。

## 1. 先读取项目内现有资料

开始任何需求前，优先查看这些文件：
- `/Users/zyc/gxxm/audit/projects/_templates/requirement.md`
- `/Users/zyc/gxxm/audit/projects/_templates/design.md`
- `/Users/zyc/gxxm/audit/projects/_templates/tasks.md`
- `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/README.md`
- `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/backend-overview.md`
- `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/api-module-map.md`
- `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/frontend-backend-contracts.md`
- `/Users/zyc/gxxm/audit/projects/skills-mcp/mcp-selection-guide.md`
- `/Users/zyc/gxxm/audit/projects/skills-mcp/mcp-installation-status.md`

如果本次需求涉及已有功能模块，再补充阅读对应源码和已有文档。

## 2. 默认沟通规则

始终遵循这些约束：
- 优先使用中文回答。
- 优先使用中文撰写新增文档。
- 对后端变更使用前端开发者也能快速理解的表达方式。
- 在做较大改动前，先用简短说明同步当前理解和下一步动作。

## 3. 默认需求拆解流程

收到新需求时，默认按以下顺序推进：

1. 先理解需求和影响范围。
2. 在 `projects/` 下为该需求准备三份文档：
   - `requirement.md`
   - `design.md`
   - `tasks.md`
3. 先补全文档，再向用户确认。
4. 未经用户确认，不开始业务代码编写。
5. 确认后再实施、验证、总结。

如果用户只要求讨论方案或整理文档，则停在文档阶段，不主动写代码。

## 4. 文档放置规则

默认使用以下方式组织文档：
- 通用模板放在 `/Users/zyc/gxxm/audit/projects/_templates/`
- 后端长期知识放在 `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/`
- 某个具体需求的三份文档放在 `projects/<feature-name>/` 下

`<feature-name>` 使用小写英文和连字符，尽量简洁，例如：
- `projects/login-security-upgrade/`
- `projects/project-review-api/`

## 5. 编码前确认规则

在以下情况出现时，必须先停下并等待用户确认：
- 即将开始新增或修改业务代码
- 即将执行可能影响较大的数据库结构调整
- 即将引入新的外部依赖、服务或 MCP
- 即将改变前后端接口契约

允许直接进行的工作：
- 阅读代码
- 产出和补全文档
- 梳理设计方案
- 做不修改业务逻辑的诊断性检查

## 6. 前端实现规则

处理前端需求时，优先遵循：
- 能抽离为组件的界面，不堆在页面文件中
- 能抽离为 Hooks、Services、常量、类型定义的逻辑，尽量分层
- 修改接口调用时，同时检查：
  - `frontend/src/service/api/`
  - `frontend/src/service/hooks/`
  - 相关类型定义

如果页面逻辑明显过重，在 `design.md` 中明确写出拆分方案，再实施。

## 7. 后端实现规则

处理后端需求时，优先遵循：
- 先说明新增文件、修改文件和各自职责
- 先说明接口、模型、数据库、配置项影响
- 变更后同步补充前端可读文档
- 需要时更新 `projects/backend-knowledge-base/` 中的长期知识

如果本次只是某个功能的局部改动，也至少在该需求自己的文档里说明：
- 改了哪些文件
- 每个文件是做什么的
- 前端需要传什么、会收到什么

## 8. MCP 使用规则

如果任务需要 MCP：
- 先说明为什么需要它
- 说明输入是什么
- 说明预期输出是什么
- 再执行

如果不确定是否需要 MCP，先给出不用 MCP 的本地方案，再补充 MCP 方案的收益和风险。

本项目优先考虑这些 MCP：
- `context7`：最新、版本相关的框架和库文档
- `playwright`：真实页面交互验证、流程回归、联调
- `chrome-devtools`：浏览器调试、Network、Console、性能分析
- `mysql-mcp`：数据库结构理解、只读查询、文档补充
- `ssh-mcp-server`：远程环境排查和远程命令执行

其中：
- `context7`、`playwright`、`chrome-devtools` 属于常规优先项
- `mysql-mcp` 默认优先只读模式
- `ssh-mcp-server` 属于高风险项，涉及远程写操作时必须再次明确确认

## 9. 交付规则

完成任务后，至少总结：
- 改动结果
- 关键文件
- 验证情况
- 未完成项或风险

如果这次没有写代码，也要明确说明停在了哪个阶段，例如：
- 已完成需求文档
- 已完成设计文档，等待确认
- 已完成 skill/MCP 配置，等待下一步
