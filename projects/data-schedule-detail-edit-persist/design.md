# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-schedule-detail-edit-persist/requirement.md`
- 设计目标：让数据调度详情页的字段编辑具备“可点击 + 可落库 + 可回读”完整链路。

## 2. 方案摘要
- 前端方案：
  - 复用现有编辑弹窗与 PATCH 调用，不改交互结构；
  - 依赖后端返回 `canEdit` 控制按钮禁用态；
  - 保存成功后继续使用 `refetch` 刷新列表。
- 后端方案：
  - 在字段组装阶段补充“可编辑判定 + 数据源定位元信息”；
  - 字段更新接口从“内存写入”改为“真实表字段 UPDATE”；
  - 保留统一返回结构 `success_response / error_response`。
- 数据流转：
  1. 详情页拉取 fields -> 后端返回 `canEdit`；
  2. 用户点击编辑并保存 -> 调用 PATCH；
  3. PATCH 校验字段可编辑与数据源定位信息；
  4. 执行数据库更新；
  5. 前端刷新后读取新值。

## 3. 架构与模块拆分
### 前端
- 页面/容器：`ScheduleDetailView`（无新增页面）。
- 可复用组件：沿用当前编辑弹窗。
- Hooks / Services：沿用 `updateDataScheduleExtractField`。

### 后端
- Django App：`backend/api`
- Views / API：
  - `get_data_schedule_extract_fields`（间接影响，返回 `canEdit`）
  - `update_data_schedule_extract_field`（核心改造）
- Models：不新增 Django Model。
- Migrations：无。

## 4. 文件规划
### 新增文件
- 无。

### 修改文件
- `backend/api/views.py`：
  - 调整字段归一化逻辑，给可编辑字段附加来源元信息；
  - 新增字段可编辑判定函数；
  - 将字段更新从内存覆盖改为数据库 UPDATE。
- `projects/backend-knowledge-base/frontend-backend-contracts.md`（可选补充）：
  - 说明“数据调度详情字段编辑”的后端行为与限制。

## 5. 接口设计
- 接口地址：`PATCH /api/data-schedule/tasks/{task_id}/extract-result/fields/{field_key}/`
- 请求参数：
  - `fieldValue: string`（必填，长度 <= 5000）
- 响应结构：保持不变，返回更新后的 `FieldRecord`。
- 异常处理：
  - 字段不存在 -> 404
  - 字段不允许编辑 -> 400
  - 字段缺少可更新的数据源信息 -> 400
  - 目标表/列/行不存在 -> 400/404

## 6. 数据模型设计
- 不新增表；使用现有行业详情表。
- 字段更新依赖字段元信息定位：
  - `sourceTable`
  - `sourceColumn`
  - `sourcePkColumn`
  - `sourcePkValue`
- 上述元信息只在服务端内部使用，不透传前端。

## 7. 状态与交互设计
- 初始状态：字段列表加载后，符合规则的字段编辑按钮可点击。
- 用户操作：点击编辑 -> 输入新值 -> 保存 -> 成功提示并刷新。
- 边界场景：
  - 空字符串允许保存（业务按“缺失值”显示）；
  - 非法字段或不可编辑字段返回错误提示；
  - 数据库更新失败时返回统一错误消息。

## 8. 复用与封装设计
- 需要抽离的公共工具：
  - `_is_data_schedule_detail_column_editable(...)`
  - `_update_data_schedule_field_value_to_db(...)`
- 为什么需要封装：
  - 将“是否可编辑”和“如何更新数据库”解耦，后续若要引入白名单/权限可独立扩展。

## 9. 文档计划
- 需要补充的后端文档：
  - 在 `projects/backend-knowledge-base/` 增补“字段编辑持久化说明”。
- 面向前端同学的说明：
  - `canEdit` 由后端动态判定；
  - 保存成功后需以接口回读结果为准。

## 10. MCP 与外部依赖
- 是否需要 MCP：否
- 使用目的：无
- 预期输入/输出：无

## 11. 测试方案
- 后端验证：
  - PATCH 成功路径：数据库值变化 + 返回体正确；
  - 字段不可编辑路径：返回 400；
  - 字段不存在路径：返回 404。
- 前端验证：
  - 编辑按钮可点击；
  - 编辑保存后列表值更新；
  - 刷新页面值仍存在。
- 手工验证：
  - 选取一条可编辑字段，执行“编辑->保存->刷新->再次进入详情页”闭环。

## 12. 风险
- 技术风险：
  - 字段与物理表列映射需保证稳定，避免误更新。
- 回滚/兜底方案：
  - 若出现异常，可临时降级为不可编辑（`canEdit=false`）保护数据；
  - 通过接口日志快速定位更新 SQL 与参数。
