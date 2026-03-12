# 登录功能使用说明

## 后端配置

### 1. 运行数据库迁移

使用Docker运行迁移命令：

```bash
# 启动数据库服务
docker-compose up -d db

# 运行迁移
docker-compose exec backend python manage.py migrate

# 创建超级用户（可选）
docker-compose exec backend python manage.py createsuperuser
```

> 使用仓库中的 `docker-compose.yml` 启动时，后端容器会自动执行：
> `migrate -> init_auth_data -> runserver`，无需手动迁移。
>
> 默认会自动初始化以下账号（不存在时创建）：
> - `admin / Admin@123456`（超级管理员）
> - `Super / 123456`
> - `Admin / 123456`
> - `User / 123456`

### 2. API端点

- `POST /api/login/` - 用户登录
  - 请求参数：`userName`, `password`
  - 返回：`{ code, msg, data: { token, refreshToken } }`

- `POST /api/register/` - 用户注册
  - 请求参数：`username`（或 `userName`）, `password`, `email`（可选）
  - 返回：`{ code, msg, data: { token, refreshToken } }`

- `POST /api/refresh-token/` - 刷新令牌
  - 请求参数：`refreshToken`
  - 返回：`{ code, msg, data: { token, refreshToken } }`

- `GET /api/user-info/` - 获取当前用户信息
  - 请求头：`Authorization: Bearer <token>`
  - 返回：`{ code, msg, data: { userId, userName, roles, buttons } }`

- `POST /api/logout/` - 用户登出
  - 返回：`{ code, msg, data: {} }`

## 前端配置

前端已配置完成，登录页面位于 `/login`

### API调用

- `fetchLogin()` - 登录
- `fetchRegister()` - 注册
- `fetchLogout()` - 登出

## 测试

启动服务后访问 `http://localhost:3000/login` 进行测试
