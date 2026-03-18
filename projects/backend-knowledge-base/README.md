# 后端知识库

## 作用
这个目录用于沉淀当前项目的后端本地知识库，目标读者以偏前端的协作者为主，所以文档会重点说明：

- 后端模块是做什么的
- 涉及哪些文件
- 前后端是如何对接的
- 修改前需要注意什么

## 当前文档
- `backend-overview.md`：后端整体架构、运行方式与主要入口
- `api-module-map.md`：`backend/api` Django 应用的职责地图
- `frontend-backend-contracts.md`：当前前后端接口契约说明
- `ai-audit-agent-reference.md`：`gxxm/ai-audit-agent` 数据库、状态接口、Nacos 配置参考
- `page-api-index.md`：按前端页面维度组织的接口文档索引
- `page-api-data-overview.md`：数据概览页接口文档（包含 summary/detail/ranking 与编写示例）

## 推荐使用方式
1. 开始新的后端需求前，先读 `backend-overview.md`。
2. 修改 Django 文件前，先读 `api-module-map.md`。
3. 修改前端接口调用或后端字段前，先读 `frontend-backend-contracts.md`。

## 当前项目协作约定
- 每个新需求默认拆成 `requirement.md`、`design.md`、`tasks.md` 三份文档。
- 编码前必须先获得用户确认。
- 前端中可复用的 UI 或逻辑优先抽成组件、Hooks、Services，不在单文件中堆代码。
- 需要使用 MCP 时，需要先说明用途、输入和预期输出。
- 后端有改动时，需要同步补充文档，说明新增文件、修改文件以及代码用途。
- 默认使用中文沟通，并优先使用中文撰写项目文档。
