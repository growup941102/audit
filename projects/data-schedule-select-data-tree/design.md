# 设计文档

## 后端
- 新增接口：`GET /api/data-schedule/select-data/`
- 查询源：`c_r_cm_project`
  - 条件：沿用有效项目过滤逻辑（`project_id` 非空、`industry` 非空、逻辑删除为未删除）
  - 字段：`root_path`
- 处理流程：
  1. `root_path` 统一路径分隔符并去重。
  2. 移除 `/home/tj/` 前缀。
  3. 按 `/` 切分为层级段。
  4. 将层级段合并构建树。
  5. 返回固定目录 `catalogs=[{id:'home_tj',name:'/home/tj'}]` 与 `projectTreeByCatalogId`。

## 前端
- 新建调度页通过 hook 调用 `select-data` 接口。
- 左侧目录使用接口目录数据（无数据时兜底 `/home/tj`）。
- 右侧树使用接口返回的 `projectTreeByCatalogId[catalogId]`。
- 保持原有勾选与已选汇总交互逻辑不变。

## 风险
- 若数据库中 `root_path` 列名变更，需扩展候选列名。
- 路径存在非数字段时，排序采用“数字优先、字符串次之”的通用策略。
