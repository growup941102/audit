# 设计文档

## 1. 概述
- 对应需求文档：`projects/system-settings-user-manage/requirement.md`
- 设计目标：实现系统设置下 `auth_user` CRUD，保持现有 API 风格。

## 2. 方案摘要
- 前端方案：新增 `system-settings/user-manage` 页面，拆分 `Search + Modal + Table`。
- 后端方案：在 `api/views.py` 增加用户管理辅助函数与 4 个接口。
- 数据流转：前端请求 `/api/system-manage/users/*` -> 后端 ORM 操作 `auth_user` -> 统一响应。

## 3. 架构与模块拆分
### 前端
- 页面/容器：`frontend/src/pages/(base)/system-settings/user-manage/index.tsx`
- 可复用组件：`modules/UserManageSearch.tsx`、`modules/UserManageModal.tsx`
- Hooks / Services：复用 `useTable`，新增 system-manage API 函数。

### 后端
- Django App：`backend/api`
- Views / API：`get/create/update/delete_system_manage_user`
- Models：复用 Django 内置 `User`
- Migrations：无

## 4. 文件规划
### 新增文件
- `backend/api/tests/test_system_user_manage_unit.py`：用户管理辅助逻辑单测
- `frontend/src/pages/(base)/system-settings/user-manage/index.tsx`：页面主文件
- `frontend/src/pages/(base)/system-settings/user-manage/modules/UserManageSearch.tsx`：查询区
- `frontend/src/pages/(base)/system-settings/user-manage/modules/UserManageModal.tsx`：新增/编辑弹窗

### 修改文件
- `backend/api/views.py`：新增用户管理辅助函数和接口
- `backend/api/urls.py`：新增用户管理路由
- `frontend/src/service/urls/system-manage.ts`：新增用户管理 URL
- `frontend/src/service/api/system-manage.ts`：新增用户管理请求函数
- `frontend/src/service/types/system-manage.d.ts`：新增 `AuthUser` 类型
- 路由与文案文件：增加系统设置子路由与 i18n

## 5. 接口设计
- `GET /api/system-manage/users/`
- `POST /api/system-manage/users/create/`
- `PUT /api/system-manage/users/{user_id}/update/`
- `DELETE /api/system-manage/users/{user_id}/delete/`

响应统一：`{ code, data, msg }`

## 6. 数据模型设计
- 表/模型：`auth_user`（Django `User`）
- 字段：`username`、`password`、`email`、`is_active`、`date_joined`、`last_login`
- 约束：用户名唯一；密码经 `set_password` 哈希。

## 7. 状态与交互设计
- 初始状态：默认分页查询
- 用户操作：查询、打开新增弹窗、打开编辑弹窗、单删、批量删
- 边界场景：编辑时密码可留空（不修改密码）；禁止删除当前登录用户

## 8. 复用与封装设计
- 需要抽离的组件：Search/Modal（避免单页堆叠）
- 需要抽离的公共工具：沿用 `useTable`
- 为什么需要封装：保证页面可读性和后续可维护性

## 9. 文档计划
- 需要补充的后端文档：本目录三份文档
- 需要新增的功能文档：用户管理接口与页面设计说明
- 面向前端同学的说明：`AuthUser` 字段与后端参数映射已固定

## 10. MCP 与外部依赖
- 是否需要 MCP：否
- 使用目的：无
- 预期输入/输出：无

## 11. 测试方案
- 前端验证：`pnpm typecheck`
- 后端验证：`manage.py test api.tests.test_system_user_manage_unit`
- 手工验证：新增/编辑/删除流程

## 12. 风险
- 技术风险：`updatedTime` 语义依赖 `last_login`
- 回滚/兜底方案：接口失败返回统一错误，前端提示并保留当前页数据
