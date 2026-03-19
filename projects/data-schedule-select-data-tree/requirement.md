# 需求文档

## 背景
新建数据调度页面中的“选择数据”弹窗，当前项目列表未接入真实数据。

## 目标
1. 左侧数据目录固定展示 `/home/tj`。
2. 右侧项目树数据来源于 `c_r_cm_project` 表。
3. 仅使用 `industry` 非空的数据（与项目有效数据规则一致）。
4. 解析 `root_path`，移除 `/home/tj/` 前缀后按 `/` 分段，合并为树结构返回。
5. 新增部分的数据获取采用反向规则：仅获取 `industry` 非空且“无 `file_prepare` 或无项目级队列”的项目。

## 示例
- `root_path=/home/tj/140/23/25`
- `root_path=/home/tj/140/24/33`

需要展示为：
- 140
  - 23
    - 25
  - 24
    - 33

## 验收标准
- 打开“选择数据”弹窗后，左侧可见固定目录 `/home/tj`。
- 右侧可见由 `root_path` 聚合后的树结构。
- 重复路径不会重复创建节点。
- 空 `root_path` 或仅为 `/home/tj` 的记录不会污染树结构。
- 新增部分仅包含 `industry` 非空，且满足以下其一的项目：
  - 不存在 `c_r_cm_file_prepare.project_id = c_r_cm_project.project_id`；
  - 存在 `c_r_cm_file_prepare`，但不存在 `c_r_cm_task_item_queue` 项目级队列（`file_id LIKE 'PROJECT:%'`）。
