# 设计文档

## 1. 概述
- 对应需求文档：`projects/auth-login-schema-sync/requirement.md`
- 设计目标：把“当前可运行的鉴权表结构”标准化沉淀，支持新库快速初始化。

## 2. 方案摘要
- 前端方案：无改动。
- 后端方案：不改业务代码，仅提供表结构知识与 SQL 兜底脚本。
- 数据流转：旧库只读导出结构 -> 文档/SQL 沉淀 -> 新库执行。

## 3. 架构与模块拆分
### 前端
- 不涉及。

### 后端
- Django App：继续使用 `django.contrib.auth` + `rest_framework.authtoken`。
- Views / API：不改动。
- Models：不新增。
- Migrations：推荐在新库仍使用 `python manage.py migrate` 作为主流程。

## 4. 文件规划
### 新增文件
- `projects/auth-login-schema-sync/requirement.md`：需求说明。
- `projects/auth-login-schema-sync/design.md`：方案说明。
- `projects/auth-login-schema-sync/tasks.md`：执行清单。
- `projects/backend-knowledge-base/auth-login-schema.md`：鉴权表结构知识沉淀。
- `projects/backend-knowledge-base/sql/auth_login_schema.sql`：可执行建表 SQL（DDL）。

### 修改文件
- 无。

## 5. 接口设计
- 无接口改动。

## 6. 数据模型设计
- 表/模型：`auth_*`、`authtoken_token`、`django_content_type`、`django_session`、`django_admin_log`。
- 字段：以当前运行库 `SHOW CREATE TABLE` 结果为准。
- 约束：保留主键、唯一键、外键约束。

## 7. 状态与交互设计
- 不涉及页面状态。

## 8. 复用与封装设计
- 复用 Django 既有鉴权体系，不做自定义用户表扩展。

## 9. 文档计划
- 需要补充的后端文档：鉴权表结构说明、落地顺序、迁移注意事项。
- 需要新增的功能文档：SQL 兜底文件使用说明。
- 面向前端同学的说明：无接口字段变化。

## 10. MCP 与外部依赖
- 是否需要 MCP：否（本次直接使用本机运行中的 MySQL 容器只读导出）。
- 使用目的：无。
- 预期输入/输出：无。

## 11. 测试方案
- 前端验证：不涉及。
- 后端验证：核对 SQL 语法与外键依赖顺序。
- 手工验证：在新库执行 SQL 后，验证表创建成功。

## 12. 风险
- 技术风险：手工执行 DDL 不会自动登记 Django 迁移历史。
- 回滚/兜底方案：优先使用 `migrate` 初始化新库；DDL 脚本仅作结构兜底或审阅。
