# 后端本地环境启动指南

## 1. 适用范围
- 仓库路径：`/Users/zyc/gxxm/audit`
- 后端目录：`/Users/zyc/gxxm/audit/backend`
- 当前后端依赖 `Django>=5.0`，必须使用 Python 3.10+（推荐 3.11）

## 2. 前置要求
- 已安装 `python3.11`
- 已安装 Docker Desktop 并可执行 `docker`、`docker compose`
- macOS 场景建议先安装编译依赖（`mysqlclient` 可能需要）：
  - `HOMEBREW_NO_AUTO_UPDATE=1 brew install mysql-client pkg-config`

## 3. 初始化 Python 虚拟环境
在 `backend/` 目录执行：

```bash
cd /Users/zyc/gxxm/audit/backend
rm -rf .venv
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip setuptools wheel
```

## 4. 安装后端依赖
```bash
cd /Users/zyc/gxxm/audit/backend
source .venv/bin/activate

# Apple Silicon
export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"
export PKG_CONFIG_PATH="/opt/homebrew/opt/mysql-client/lib/pkgconfig"

# Intel Mac 使用以下两行替换
# export PATH="/usr/local/opt/mysql-client/bin:$PATH"
# export PKG_CONFIG_PATH="/usr/local/opt/mysql-client/lib/pkgconfig"

pip install -r requirements.txt
```

## 5. 启动本地 MySQL（Docker）
```bash
docker run -d --name audit-mysql \
  -e MYSQL_ROOT_PASSWORD=mysql123 \
  -e MYSQL_DATABASE=tjsj \
  -p 3306:3306 \
  mysql:8.0
```

检查端口：

```bash
nc -z localhost 3306 && echo "3306 open" || echo "3306 closed"
```

## 6. 配置运行时环境变量
当前项目 `backend/tjsj/settings.py` 默认 `DB_HOST=db`，本地直连 MySQL 时建议显式覆盖：

```bash
cd /Users/zyc/gxxm/audit/backend
source .venv/bin/activate

export DB_HOST=127.0.0.1
export DB_PORT=3306
export MYSQL_DATABASE=tjsj
export MYSQL_USER=root
export MYSQL_PASSWORD=mysql123

# 本地先关闭 MinIO，避免对象存储未启动导致阻塞
export MINIO_ENABLED=0
export DEBUG=1
```

## 7. 数据库迁移与账号初始化
```bash
cd /Users/zyc/gxxm/audit/backend
source .venv/bin/activate

python manage.py migrate
python manage.py init_auth_data
```

`init_auth_data` 默认会确保管理员账号存在：
- 用户名：`admin`
- 密码：`cmcc@tj10086`

## 8. 启动后端服务
```bash
cd /Users/zyc/gxxm/audit/backend
source .venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

## 9. 启动后验证
- 健康检查：`http://127.0.0.1:8000/api/health/`
- Swagger：`http://127.0.0.1:8000/swagger/`
- ReDoc：`http://127.0.0.1:8000/redoc/`

## 10. 常见问题排查

### 10.1 `No matching distribution found for Django<6.0,>=5.0`
原因：当前虚拟环境 Python 版本低于 3.10（常见为 3.9）。

处理：
1. 删除旧 `.venv`
2. 用 `python3.11 -m venv .venv` 重建
3. 重新 `pip install -r requirements.txt`

### 10.2 `brew install` 卡在 `Auto-updating Homebrew...`
现象：长时间停留在自动更新提示。

处理：
```bash
Ctrl + C
HOMEBREW_NO_AUTO_UPDATE=1 brew install mysql-client pkg-config
```

### 10.3 `mysqlclient` 编译失败
处理步骤：
1. 确认 `mysql-client`、`pkg-config` 已安装
2. 确认 `PATH` 与 `PKG_CONFIG_PATH` 已按芯片架构导出
3. 在激活的 `.venv` 中重试 `pip install -r requirements.txt`

### 10.4 3306 端口未监听
先检查容器状态：
```bash
docker ps -a | grep audit-mysql
docker logs audit-mysql --tail 200
```

若容器异常，先删除再重建：
```bash
docker rm -f audit-mysql
docker run -d --name audit-mysql \
  -e MYSQL_ROOT_PASSWORD=mysql123 \
  -e MYSQL_DATABASE=tjsj \
  -p 3306:3306 \
  mysql:8.0
```
