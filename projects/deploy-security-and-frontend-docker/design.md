# 设计文档

## 1. 概述
- 对应需求文档：`projects/deploy-security-and-frontend-docker/requirement.md`
- 设计目标：在不改业务代码的前提下，完成部署安全基线与前端 Docker 生产化。

## 2. 方案摘要
- 安全配置：
  - 将 `.env` 与 `docker-compose.yml` 的默认敏感值替换为占位符。
  - 管理员初始化改为仅使用环境变量密码；未配置时自动生成一次性随机密码。
- 前端部署：
  - `frontend/Dockerfile` 改为多阶段构建。
  - `builder` 阶段执行 `pnpm build`，`runtime` 阶段使用 Nginx 提供静态资源。
  - `/api/` 由 Nginx 反向代理到 `backend:8000`。
- 编排层：
  - `docker-compose.yml` 新增 `frontend` 服务并暴露 `FRONTEND_PORT`。

## 3. 文件规划
### 新增文件
- `frontend/nginx.conf`：前端静态托管与 API 反向代理。
- `frontend/.env.prod`：前端生产构建环境变量。
- `projects/deploy-security-and-frontend-docker/requirement.md`
- `projects/deploy-security-and-frontend-docker/design.md`
- `projects/deploy-security-and-frontend-docker/tasks.md`

### 修改文件
- `.env`
- `docker-compose.yml`
- `frontend/Dockerfile`
- `backend/api/management/commands/init_auth_data.py`
- `backend/tjsj/settings.py`
- `backend/README_LOGIN.md`
- `README.md`

## 4. 风险与兜底
- 风险：占位符未替换会导致登录/数据库连接失败。
- 兜底：文档明确要求部署前替换四项关键参数并执行健康检查验证。
