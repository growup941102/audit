# audit

审计项目。

## Docker 部署（前后端 + MySQL）

1. 先修改根目录 `.env` 中的占位符，至少包括：
   - `MYSQL_ROOT_PASSWORD`
   - `MYSQL_PASSWORD`
   - `SECRET_KEY`
   - `INIT_ADMIN_PASSWORD`
2. 在仓库根目录启动：

```bash
docker compose up -d --build
```

3. 访问：
   - 前端：`http://<服务器IP>:${FRONTEND_PORT}`（默认 80）
   - 后端健康检查：`http://<服务器IP>:${BACKEND_PORT}/api/health/`（默认 8000）
   - Swagger：`http://<服务器IP>:${BACKEND_PORT}/swagger/`

## 说明

- 前端容器使用 Nginx 托管构建产物，并把 `/api` 反向代理到 `backend:8000`。
- 如连接远程数据库，请把 `MYSQL_HOST` 改成远程地址，并把 `DJANGO_DB_INIT=0`（避免自动迁移/初始化写入远程库）。
