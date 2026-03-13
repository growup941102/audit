# grok-search 使用说明

## 1. 目的
这份文档用于记录当前环境中 `grok-search` 的可用配置、已做的兼容性处理，以及后续在项目中的使用方式。

## 2. 当前生效的全局配置
- 全局技能目录：`/Users/zyc/.codex/skills/grok-search`
- 当前可用端点：`http://150.40.177.127:3000`
- 当前模型：`grok-4`

## 3. 本次调整内容

### 配置调整
- 将 `grok-search` 默认配置从 `https://windhub.cc` 切换为 `grok.js` 中验证可用的配置。
- 原因：
  - `windhub.cc` 在本机 Python 请求中存在证书校验问题。
  - 即便临时绕过证书校验，聊天补全接口仍返回 `500`。

### 脚本兼容性调整
- 目标文件：`/Users/zyc/.codex/skills/grok-search/scripts/grok_search.py`
- 调整点：
  - 支持解析 Markdown 代码块中的 JSON。
  - 当模型没有严格返回 JSON，而是返回普通文本时，将文本内容写入 `content`，不再只放进 `raw`。
  - 放宽系统提示词，改为“优先返回 JSON，如果不行则返回带来源的普通文本”，减少被模型误判为强制输出格式的问题。

## 4. 使用方式

### 命令行调用
```bash
python3 /Users/zyc/.codex/skills/grok-search/scripts/grok_search.py --query "React Router 7 最新文档重点是什么？"
```

### 结果字段说明
- `ok`：请求是否成功
- `content`：主回答内容
- `sources`：提取到的来源链接
- `raw`：模型原始输出，便于排查兼容性问题

## 5. 当前已知情况
- 该能力在沙箱内可能因为网络限制无法直接请求，需要在允许外网访问的场景下使用。
- 当前端点能够正常响应，但不同模型/网关实现不一定严格遵守 JSON 输出约束，因此保留了 `raw` 字段作为兜底。

## 6. 后续建议
- 如果后面切换新的 Grok 网关，优先验证：
  - `/v1/models` 是否可用
  - `/v1/chat/completions` 是否正常返回
  - 返回内容是否为 JSON，或是否至少能稳定输出普通文本
- 如果未来要把它接成更正式的 MCP，可以复用这里的端点配置和兼容性结论。

