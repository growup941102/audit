## 角色定义

必须：
- 遵循本文档全部规范；
- 优先输出简体中文；
- 仅在用户确认后修改业务代码；
- 优先将项目相关规范、知识和说明沉淀到 `projects/` 目录中。

## 项目工作流

在 `/Users/zyc/gxxm/audit` 仓库中工作时，优先使用项目 skill：
- `audit-project-workflow`
- 路径：`/Users/zyc/gxxm/audit/projects/skills-mcp/audit-project-workflow/SKILL.md`

当需求涉及前后端实现、后端文档补充、接口联调、skill/MCP 沉淀、需求拆解时，先读取该 skill，并按其中流程执行。

## 默认协作规则

- 默认使用中文回答与写文档。
- 新需求默认先整理三份文档：
  - `requirement.md`
  - `design.md`
  - `tasks.md`
- 未经用户确认，不开始业务代码编写。
- 前端中可复用的 UI 或逻辑优先拆分为组件、Hooks、Services，不在单文件堆代码。
- 后端改动后，需要同步补充前端可读的说明文档，并在 `projects/` 中沉淀长期知识。
- 需要使用 MCP 时，先说明用途、输入和预期输出，再执行。

## 项目知识入口

开始处理需求前，优先阅读以下资料：
- `/Users/zyc/gxxm/audit/projects/_templates/requirement.md`
- `/Users/zyc/gxxm/audit/projects/_templates/design.md`
- `/Users/zyc/gxxm/audit/projects/_templates/tasks.md`
- `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/README.md`
- `/Users/zyc/gxxm/audit/projects/skills-mcp/mcp-selection-guide.md`
- `/Users/zyc/gxxm/audit/projects/skills-mcp/mcp-installation-status.md`

## MCP 规则

当前项目优先考虑这些 MCP：
- `playwright`
- `chrome-devtools`
- `context7`
- `zibdie-ssh-mcp-server`
- `gcluowenqiang-mysql-mcp`

使用任意 MCP 前，必须先说明：
- 为什么这次需要它
- 输入是什么
- 预期输出是什么
- 是否可能产生写操作或环境副作用

补充约束：
- `context7` 优先用于最新文档和版本相关 API 用法确认
- `playwright` 优先用于页面交互验证和联调回归
- `chrome-devtools` 优先用于控制台、网络、性能和 DOM/CSS 问题定位
- `gcluowenqiang-mysql-mcp` 默认优先只读模式
- `zibdie-ssh-mcp-server` 视为高风险 MCP，涉及远程写操作、脚本执行、配置修改时必须再次确认

## 联网搜索规则

遇到以下任何情况时，必须先使用 `grok-search` 技能进行搜索，然后再回答：

1. 版本号、发布日期或更新日志信息
2. API 文档或 SDK 使用方法
3. 错误信息或故障排除
4. 任何项目、服务或技术的当前状态
5. 任何可能过时或时效性强的信息
6. 包安装命令或依赖项
7. 官方文档链接

执行约束（Codex 沙箱场景）：
- 默认优先执行 `grok-search`；
- 若出现 `Operation not permitted` 或其它网络拦截错误，必须立即以提权方式重试（`sandbox_permissions: require_escalated`）；
- 若返回结果中 `sources` 为空，必须重写查询并再次搜索，直到拿到可引用来源；
- 回答前必须拿到搜索结果，并在回复中附来源链接。

使用示例：
```bash
python3 /Users/zyc/.codex/skills/grok-search/scripts/grok_search.py --query "你的搜索查询"
```

收到搜索结果后，在回答中引用来源。
