# 后端总览

## 1. 技术栈
- 后端框架：Django
- API 形式：以 Django REST Framework 风格的函数视图为主
- 鉴权方式：DRF Token Authentication，并扩展支持 Bearer Token
- 数据库：MySQL
- 接口文档：`drf_yasg` 提供的 Swagger / ReDoc

## 2. 主要入口文件
- `backend/manage.py`
  - Django 管理入口，用于启动项目、执行迁移、运行自定义命令。
- `backend/tjsj/settings.py`
  - 全局配置文件，包含已安装应用、数据库配置、鉴权配置、CORS、验证码、登录安全策略、MinIO 相关配置等。
- `backend/tjsj/urls.py`
  - 根路由入口，将业务 API 挂载到 `/api/`，并暴露 `/swagger/` 与 `/redoc/`。

## 3. 当前应用结构
- `backend/api/`
  - 当前项目的核心业务 Django App。
  - 承载登录注册、验证码、站点设置、水印设置等主要后端逻辑。

## 4. 当前后端现状
目前大部分自定义后端逻辑都集中在 `backend/api` 这一个 Django App 中。

这意味着：
- 项目当前还处在较为紧凑的阶段
- 许多职责还集中在一个应用和少量文件里
- 后续需求增多时，可能需要继续拆分服务层、校验层、工具层，甚至拆分多个 Django App

## 5. 运行与配置说明
- 数据库使用 MySQL，默认连接参数来自 `backend/tjsj/settings.py` 中读取的环境变量。
- 当前已开启全量 CORS 允许。
- Token 鉴权支持 `Authorization: Bearer <token>`。
- Refresh Token 时效、验证码有效期、登录失败锁定策略、站点资源大小限制等都由配置项控制。

## 6. 文档入口
- `/swagger/`
- `/redoc/`

在前后端联调或修改接口字段前，可以先通过这两个入口确认现有请求和响应结构。

## 7. 修改后端前需要注意的点
- `backend/api/views.py` 当前体量较大且职责集中，新增逻辑时要尽量避免继续堆在单个函数里，能抽 helper 就优先抽 helper。
- 如果修改了模型字段，需要同步维护 `backend/api/migrations/` 下的迁移文件。
- 如果接口契约有变化，前端的 service、hooks、类型定义通常也需要一起调整。
- 因为当前项目中存在偏前端角色的协作者，所以后端改动最好同步说明：
  - 新增或修改了哪些文件
  - 每个文件负责什么
  - 前端需要传什么、会收到什么

## 8. 每个功能建议的文档模式
每个新功能建议先准备：
- `requirement.md`
- `design.md`
- `tasks.md`

编码前文档至少应明确：
- 业务目标
- 接口与数据影响
- 是否存在可复用组件机会
- 是否需要 MCP 或外部服务

