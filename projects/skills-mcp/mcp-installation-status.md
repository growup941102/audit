# MCP 安装与测试状态

## 1. 目的
这份文档记录当前本机 MCP 的实际安装结果、全局配置方式、测试状态和后续待补信息，避免后面换线程时重复排查。

## 2. 当前安装结论

当前已完成全局安装/登记的 MCP：
- `playwright`
- `chrome-devtools`
- `context7`
- `ssh-mcp-server`
- `mysql-mcp`

## 3. 全局配置位置

- Codex 全局 MCP 配置通过 `codex mcp add` 写入
- 配置入口实际位于：`/Users/zyc/.codex/config.toml`

## 4. 安装方式

### 4.1 Node 类 MCP
以下 4 个 MCP 使用本机 `nvm` 中的 Node：
- `playwright`
- `chrome-devtools`
- `context7`
- `ssh-mcp-server`

本次实际使用的 Node 版本：
- `v24.13.0`

由于 Codex 在直接拉起 MCP 时不会自动继承 `nvm` 环境，因此这些 MCP 在配置中都补了显式 `PATH`，确保能找到：
- `node`
- `npm`
- `npx`

### 4.2 MySQL MCP
`gcluowenqiang-mysql-mcp` 安装在全局目录：
- `/Users/zyc/.codex/mcp-servers/gcluowenqiang-mysql-mcp`

并创建了独立虚拟环境：
- `/Users/zyc/.codex/mcp-servers/gcluowenqiang-mysql-mcp/.venv`

## 5. 当前配置摘要

### Playwright
- 启动方式：
  - `npx -y @playwright/mcp@latest --browser chrome`
- 说明：
  - 显式使用本机 Chrome

### Chrome DevTools
- 启动方式：
  - `npx -y chrome-devtools-mcp@latest --channel stable --isolated`
- 说明：
  - 使用本机稳定版 Chrome
  - 使用隔离 profile

### Context7
- 启动方式：
  - `npx -y @upstash/context7-mcp@latest`
- 说明：
  - 本次没有使用远程 URL 版本
  - 原因是远程版本会触发 OAuth，且本机 Python 对其 HTTPS 端点做独立探测时遇到证书校验问题
  - 本地 `npx` 版本更稳

### SSH MCP Server
- 启动方式：
  - `npx -y @zibdie/ssh-mcp-server@latest`
- 说明：
  - 当前只完成服务安装与启动测试
  - 还没有配置真实 SSH 连接目标

### MySQL MCP
- 启动方式：
  - `/Users/zyc/.codex/mcp-servers/gcluowenqiang-mysql-mcp/.venv/bin/python /Users/zyc/.codex/mcp-servers/gcluowenqiang-mysql-mcp/main.py`
- 当前预置环境变量：
  - `MYSQL_HOST=localhost`
  - `MYSQL_PORT=3306`
  - `MYSQL_USERNAME=root`
  - `MYSQL_PASSWORD=mysql123`
  - `MYSQL_DATABASE=tjsj`
  - `MYSQL_SECURITY_MODE=readonly`
  - `MYSQL_ALLOWED_SCHEMAS=*`
  - `MYSQL_ENABLE_QUERY_LOG=false`
- 说明：
  - 当前是安全优先的只读模式
  - 连接参数是占位/开发默认值，后续需要改成真实库信息

## 6. 测试结果

### Playwright
- 结果：
  - 启动级测试通过
- 现象：
  - 进程可正常进入待命状态

### Chrome DevTools
- 结果：
  - 启动级测试通过
- 现象：
  - 命令可正常启动并输出服务说明

### Context7
- 结果：
  - 启动级测试通过
- 现象：
  - 本地 `stdio` 版本可正常输出 `running on stdio`

### SSH MCP Server
- 结果：
  - 启动级测试通过
- 现象：
  - 可正常输出 `SSH MCP Server running on stdio`

### MySQL MCP
- 结果：
  - 服务启动测试通过
  - 数据库连接测试未通过
- 现象：
  - 服务能启动
  - 但当前 `localhost:3306` 没有可连接的 MySQL 服务，因此连接测试失败
- 结论：
  - MCP 服务本身已安装成功
  - 真实数据库连通性仍需补配置或启动本地数据库

## 7. 当前待补信息

### SSH MCP
后续如果要真正使用，还需要你提供：
- 主机/IP
- 端口
- 用户名
- 鉴权方式（密码/密钥）

### MySQL MCP
后续如果要真正连库，还需要你确认：
- 数据库主机
- 端口
- 用户名
- 密码
- 数据库名

## 8. 建议的下一步

1. 重启 Codex 或至少新开一个会话，让桌面端稳定读取最新 MCP 配置。
2. 先用 `playwright`、`chrome-devtools`、`context7` 做一次轻量验证。
3. 等你提供 SSH 和 MySQL 的真实连接信息后，再做端到端连接测试。

