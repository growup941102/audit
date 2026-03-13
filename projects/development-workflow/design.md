# 设计文档

## 1. 概述
- 对应需求文档：`projects/development-workflow/requirement.md`
- 设计目标：提供统一、可执行、可复现的项目开发协作流程，作为后续迭代的默认工作手册。

## 2. 方案摘要
- 前端方案：
  - 使用 VS Code 开发 `frontend/`。
  - 通过环境变量管理 API 基地址。
  - 与后端接口契约保持同步，优先走 `service/api` 与 `hooks` 层。
- 后端方案：
  - 使用 PyCharm 开发 `backend/`。
  - 使用 Python venv + Django migration 管理依赖与数据库结构。
  - 通过环境变量统一数据库连接。
- 数据流转：
  - 浏览器 -> 前端请求层 -> Django API -> MySQL。
  - DataGrip 用于验证数据状态和执行开发 SQL（生产默认只读）。

## 3. 架构与模块拆分
### 前端
- 页面/容器：`frontend/src/pages/`
- 可复用组件：`frontend/src/components/`
- Hooks / Services：
  - `frontend/src/service/api/`
  - `frontend/src/service/hooks/`
  - `frontend/src/service/urls/`

### 后端
- Django App：`backend/api`
- Views / API：
  - `backend/api/views.py`
  - `backend/api/urls.py`
- Models：
  - `backend/api/models.py`
- Migrations：
  - `backend/api/migrations/`

## 4. 文件规划
### 新增文件
- `projects/development-workflow/requirement.md`：流程需求与目标定义
- `projects/development-workflow/design.md`：流程设计与执行规范
- `projects/development-workflow/tasks.md`：执行任务清单

### 修改文件
- 无

## 5. 接口设计
- 接口地址：不新增业务接口，本次只定义协作与联调流程。
- 请求方法：不涉及。
- 请求参数：不涉及。
- 响应结构：不涉及。
- 异常处理：统一使用“分层定位”：
  - 连接失败优先检查服务状态与端口
  - 业务异常再检查接口契约与字段映射

## 6. 数据模型设计
- 表/模型：不新增模型。
- 字段：不新增字段。
- 约束：数据库结构变更必须通过 Django migration，不允许仅在 DataGrip 手改后不回写代码。

## 7. 状态与交互设计
- 初始状态：
  - 前端服务未启动
  - 后端服务未启动
  - MySQL 未连接
- 用户操作：
  1. 启动数据库（推荐 Docker MySQL）
  2. 后端执行迁移和初始化
  3. 启动后端服务
  4. 启动前端服务
  5. DataGrip 验证数据
- 边界场景：
  - `127.0.0.1:3306` 连接失败：通常是 MySQL 服务未运行或端口未映射。
  - 登录失败：先看验证码/鉴权逻辑，再看数据。
  - 字段不一致：先核对后端响应，再核对前端类型定义与映射。

## 8. 复用与封装设计
- 需要抽离的组件：不涉及。
- 需要抽离的公共工具：建议将环境启动、检查命令沉淀为脚本（后续任务）。
- 为什么需要封装：降低每次新会话重复操作成本，减少人工步骤遗漏。

## 9. 文档计划
- 需要补充的后端文档：
  - 在 `projects/backend-knowledge-base/` 持续维护接口契约和模型变化。
- 需要新增的功能文档：
  - 每个新功能在 `projects/<feature-name>/` 继续维护三件套文档。
- 面向前端同学的说明：
  - 接口字段变更时同步更新 `frontend-backend-contracts.md`。

## 10. MCP 与外部依赖
- 是否需要 MCP：非必须。
- 使用目的：数据库只读排查可使用 MySQL MCP；最新文档查证可用 context7/grok-search。
- 预期输入/输出：
  - 输入：问题描述、连接信息、目标查询。
  - 输出：可复现排查结论与修复建议。

## 11. 测试方案
- 前端验证：
  - 登录、系统设置、水印设置页面可正常请求后端。
- 后端验证：
  - `python manage.py migrate` 成功。
  - 核心接口（登录/获取用户信息/系统设置）可用。
- 手工验证：
  - DataGrip 可连接开发库并查询 `website_settings`、`auth_user`。

## 12. 风险
- 技术风险：
  - 本机未运行 MySQL 导致全链路不可用。
  - 本地环境变量不一致导致“前端可跑、后端连不上库”。
- 回滚/兜底方案：
  - 默认使用 Docker MySQL 单点方案，统一端口和账号。
  - 任何数据库结构变更失败时回滚 migration，再重新生成并验证。
