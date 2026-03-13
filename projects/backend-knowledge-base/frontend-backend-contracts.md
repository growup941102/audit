# 前后端契约说明

## 1. 目的
这份文档用于记录 React 前端与 Django 后端之间的主要契约点，方便后续需求在实现时减少反复确认成本。

## 2. 前端契约入口
- `frontend/src/service/api/system-manage.ts`
  - 封装系统设置相关请求
- `frontend/src/service/hooks/useSystemManage.ts`
  - 提供系统设置相关的 React Query Hooks
- `frontend/src/service/api/auth.ts`
  - 封装鉴权相关请求

## 3. 后端契约入口
- `backend/api/urls.py`
  - 定义后端接口路径
- `backend/api/views.py`
  - 负责参数解析、校验和响应拼装

## 4. 当前已识别的契约范围

### 鉴权相关
- 后端接口包括：
  - `/api/login/`
  - `/api/register/`
  - `/api/refresh-token/`
  - `/api/user-info/`
  - `/api/logout/`
  - `/api/captcha/`

### 系统管理相关
- 后端接口包括：
  - `/api/system-manage/website-settings/`
  - `/api/system-manage/website-settings/update/`
  - `/api/system-manage/website-settings/upload/`
  - `/api/system-manage/website-brand-settings/`
  - `/api/system-manage/website-brand-settings/update/`
  - `/api/system-manage/watermark-settings/`
  - `/api/system-manage/watermark-settings/update/`

- 同时还保留了一部分旧版兼容路径，例如：
  - `/api/systemManage/getWebsiteSettings`
  - `/api/systemManage/updateWebsiteSettings`
  - `/api/systemManage/getWatermarkSettings`

## 5. 契约维护检查清单
- 后端字段名变化时，同步更新前端请求/响应类型定义。
- 后端路径变化时，同步更新前端 URL 常量与 service 封装。
- 鉴权头、Token 结构或刷新逻辑变化时，联调验证登录、刷新和受保护请求。
- 上传逻辑变化时，验证请求体格式、文件类型限制和返回字段。

## 6. 后续需求的文档补充清单
当一个需求同时影响前后端时，至少记录：
- 修改了哪个前端 service 文件
- 修改了哪个后端路由或视图文件
- 请求字段有哪些变化
- 响应字段有哪些变化
- 是否保留向后兼容
- 老路径或老字段是否还继续支持

## 7. 推荐工作顺序
1. 先完成 `requirement.md`。
2. 再完成 `design.md`。
3. 用户确认后再开始编码。
4. 前后端契约一起更新。
5. 同步补充便于前端开发者快速阅读的变更说明。

