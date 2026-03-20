# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-schedule-delete-queue-only/requirement.md`
- 设计目标：确保删除动作只清理队列表，且支持“相关数据”语义。

## 2. 方案摘要
- 新增按 `project_id` 删除队列表记录函数。
- 删除动作优先按项目维度清理 `c_r_cm_task_item_queue`（并保留 `file_id LIKE 'PROJECT:%'` 约束）。
- 若项目ID缺失，再降级按 taskId 删除。
- 不引入任何 `c_r_cm_project` 的删除/更新操作。

## 3. 影响文件
- `backend/api/views.py`：删除逻辑实现。
- `backend/api/tests/`：新增删除动作回归测试。

## 4. 风险
- 按项目删除会扩大删除范围（同项目历史队列记录会一并清理），符合“相关数据”预期。
