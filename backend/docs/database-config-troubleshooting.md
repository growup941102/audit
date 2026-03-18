# 数据库配置排查手册（Django + MySQL）

## 1. 适用场景
当后端启动报错涉及以下关键词时，按本文排查：
- `Unknown MySQL server host 'db'`
- `Can't connect to MySQL server`
- `Unknown database 'xxx'`
- 明明改了配置，但 Django 仍连接到其他库

## 2. 本次问题复盘（可对照）
- 现象 1：后端报 `Unknown MySQL server host 'db'`
- 根因：本地运行时仍使用了 `DB_HOST=db`（容器内主机名），非本机可解析地址
- 现象 2：切换配置后仍连本地库
- 根因：当前终端/IDE 仍残留 `DB_HOST/DB_PORT/MYSQL_*` 环境变量
- 现象 3：`nc` 端口通，但 Django 仍报连接失败
- 结论：端口可达不等于 MySQL 协议登录成功，还需验证账号、密码、库名、权限

## 3. Django 数据库配置优先级
当前项目配置（`backend/tjsj/settings.py`）核心逻辑：

```py
'NAME': os.getenv('MYSQL_DATABASE', 'audit_agent')
'USER': os.getenv('MYSQL_USERNAME', os.getenv('MYSQL_USER', 'root'))
'PASSWORD': os.getenv('MYSQL_PASSWORD', 'root123')
'HOST': os.getenv('MYSQL_HOST', os.getenv('DB_HOST', '10.1.221.233'))
'PORT': os.getenv('MYSQL_PORT', os.getenv('DB_PORT', '33603'))
```

含义：
1. 先读环境变量
2. 没有环境变量才使用默认值

所以“看起来改了 settings 默认值但没生效”，通常是因为环境变量还在。

## 4. 标准排查流程（从快到慢）

### 步骤 1：确认 Django 实际读取了哪套配置
```bash
cd /Users/zyc/gxxm/audit/backend
source .venv/bin/activate
python manage.py shell -c "from django.conf import settings; print(settings.DATABASES['default'])"
```

只看这 4 个字段：`HOST`、`PORT`、`NAME`、`USER`。

### 步骤 2：检查环境变量污染
```bash
env | grep -E 'MYSQL_|DB_HOST|DB_PORT'
```

若要回退到 `settings.py` 默认值，先清理：
```bash
unset DB_HOST DB_PORT MYSQL_DATABASE MYSQL_USER MYSQL_USERNAME MYSQL_PASSWORD MYSQL_HOST MYSQL_PORT
```

再执行一次步骤 1，确认已切换。

### 步骤 3：确认网络端口可达
```bash
nc -vz <HOST> <PORT>
# 例：nc -vz 10.1.221.233 33603
```

- `succeeded`：端口通，继续步骤 4
- 失败：网络/防火墙/服务未启动，先处理网络连通性

### 步骤 4：确认 MySQL 登录能力（协议级）
```bash
mysql -h <HOST> -P <PORT> -u <USER> -p
```

如果提示 `mysql: command not found`：
```bash
# Apple Silicon
export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"
# Intel
# export PATH="/usr/local/opt/mysql-client/bin:$PATH"
```

### 步骤 5：确认数据库存在
登录后执行：
```sql
SHOW DATABASES;
USE audit_agent;
SHOW TABLES;
```

判定：
- `Unknown database 'audit_agent'`：库不存在
- 可 `USE` 成功但无表：需要迁移
- 有表：数据库基本正常

### 步骤 6：用 Django 做最终闭环验证
```bash
cd /Users/zyc/gxxm/audit/backend
source .venv/bin/activate
python manage.py shell -c "from django.db import connection; c=connection.cursor(); c.execute('SELECT DATABASE()'); print(c.fetchone())"
```

输出 `('audit_agent',)` 代表 Django 实际连到目标库。

## 5. 常见报错与对应处理

### A. `Unknown MySQL server host 'db'`
原因：本地运行却使用了容器内主机名 `db`。
处理：
- 改为可达地址（如 `127.0.0.1` 或远端 IP）
- 或清理环境变量后使用 settings 默认值

### B. `Can't connect to MySQL server on 'x.x.x.x:port'`
原因：网络不通/服务未启动/认证前即连接失败。
处理：
1. `nc -vz` 验证端口
2. `mysql -h -P -u -p` 验证协议登录
3. 确认白名单、防火墙、服务状态

### C. `Unknown database 'audit_agent'`
原因：库不存在。
处理：
- 先建库（DBA 或本地）
- 再执行 `python manage.py migrate`

### D. 明明改了 settings，仍连错库
原因：环境变量优先级高于默认值。
处理：
- `env | grep -E 'MYSQL_|DB_HOST|DB_PORT'`
- `unset ...`
- 重启同一终端中的 `runserver`

## 6. 推荐启动前自检清单
每次启动前执行：

```bash
cd /Users/zyc/gxxm/audit/backend
source .venv/bin/activate
python manage.py shell -c "from django.conf import settings; d=settings.DATABASES['default']; print(d['HOST'], d['PORT'], d['NAME'], d['USER'])"
```

确认输出与你预期一致，再执行：

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## 7. 建议约定（减少后续踩坑）
- 本地开发统一使用一个启动脚本（导出固定环境变量）
- IDE Run Configuration 明确写环境变量，避免和终端状态不一致
- 远端库与本地库不要混用同一终端会话
- 每次切库前先 `env | grep`，每次启动前先打印 Django 读取值
