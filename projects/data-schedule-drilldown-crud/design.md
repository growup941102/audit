# 设计文档

## 1. 概述
- 目标页面：`frontend/src/pages/(base)/data-fetch/data-schedule/modules/ScheduleDetailView.tsx`
- 目标后端：`backend/api/views.py`
- 约束：按 TDD + safe-sql 执行；数据库写入通过参数化 SQL + 命中范围校验。

## 2. 方案摘要
- 字段编辑：
  - 扩展行定位器生成逻辑，补充“无 id/*_id 时按非空字段兜底”。
  - 使 `canEdit` 不再因缺少主键字段一律为 false。
- 下钻 CRUD：
  - `_build_data_schedule_drilldown_from_table` 动态返回 `actions`、`editableColumns`、`defaultInsertValues`、`sourceTable`。
  - 新增 `_create/_update/_delete_data_schedule_drilldown_row_to_db` 三个 helper，统一做表/列安全校验、命中行唯一性校验、参数化写入。
  - `create/update/delete` API 调用上述 helper，替换原内存态改动。
- 前端：
  - 下钻弹窗新增/编辑表单仅渲染 `column.editable === true` 的列，避免只读列导致“按钮可点但无法提交”。

## 3. TDD 用例
- `test_data_schedule_field_edit_persist.py`
  - 新增：无 id/*_id 时 fallback locator 生效并 `canEdit=True`。
- `test_data_schedule_drilldown_crud_persist.py`
  - 新增：drilldown payload 的动作开关按可写条件为 true。
  - 新增：create/update/delete helper 分别执行真实 INSERT/UPDATE/DELETE。

## 4. 风险与兜底
- 风险：兜底 locator 可能命中多行。
- 兜底：写入前统一 `SELECT COUNT(1)` 校验，命中 >1 时拒绝写入并返回“更新目标不唯一”。
