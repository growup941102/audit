# 登录/鉴权表结构沉淀（用于新库复用）

## 1. 背景
- 当前项目登录鉴权使用 Django 内置认证体系与 DRF Token。
- 代码入口：
  - `backend/tjsj/settings.py`：启用 `django.contrib.auth`、`django.contrib.sessions`、`rest_framework.authtoken`
  - `backend/api/views.py`：登录时创建/刷新 `authtoken_token`

## 2. 现网导出来源
- 导出时间：2026-03-17
- 导出来源：本机运行中的 MySQL 容器 `tjsj-mysql`，数据库 `tjsj`
- 导出方式：`SHOW CREATE TABLE`

## 3. 鉴权相关表清单

### 核心必需（登录 + Token 鉴权）
- `auth_user`
- `authtoken_token`
- `django_content_type`
- `auth_permission`
- `auth_group`
- `auth_group_permissions`
- `auth_user_groups`
- `auth_user_user_permissions`

### 推荐保留（Django 管理与会话）
- `django_session`
- `django_admin_log`

## 4. 表间依赖关系（简化）
- `auth_permission.content_type_id` -> `django_content_type.id`
- `auth_group_permissions.group_id` -> `auth_group.id`
- `auth_group_permissions.permission_id` -> `auth_permission.id`
- `auth_user_groups.user_id` -> `auth_user.id`
- `auth_user_groups.group_id` -> `auth_group.id`
- `auth_user_user_permissions.user_id` -> `auth_user.id`
- `auth_user_user_permissions.permission_id` -> `auth_permission.id`
- `authtoken_token.user_id` -> `auth_user.id`
- `django_admin_log.content_type_id` -> `django_content_type.id`
- `django_admin_log.user_id` -> `auth_user.id`

## 5. 新库落地建议（推荐）
1. 推荐主路径：在新库直接执行 Django 迁移  
   `python manage.py migrate`
2. 再执行初始化账号  
   `python manage.py init_auth_data`

原因：
- 会自动创建完整表结构并登记 `django_migrations`；
- 后续迭代迁移更稳定。

## 6. SQL 兜底文件
- 路径：`projects/backend-knowledge-base/sql/auth_login_schema.sql`
- 用途：需要手工先建结构时使用（例如先由 DBA 审核建表语句）。

## 7. 重要注意事项
- 若只执行 SQL 建表而不登记迁移历史，后续直接 `migrate` 可能出现“重复建表”冲突。
- 若走“先手工建表”路径，需额外规划迁移历史对齐策略（例如 `--fake-initial` 评估后使用）。
