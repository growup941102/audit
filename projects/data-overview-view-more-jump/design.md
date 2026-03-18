# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-overview-view-more-jump/requirement.md`
- 设计目标：从数据概览排名一键进入数据调度，并自动继承当前执行状态筛选。

## 2. 方案摘要
- 前端方案：
  - 在 `TaskRanking` 中新增“分类 -> 数据调度状态”映射；
  - 按钮点击时携带 `taskStatus` 查询参数跳转；
  - 在 `DataSchedule` 页面首次进入列表态时读取 URL 的 `taskStatus` 并自动写入筛选表单后触发查询。
- 后端方案：无。
- 数据流转：
  1. 用户在排名模块选择分类并点击“查看更多数据”；
  2. 跳转到 `/data-fetch/data-schedule?taskStatus=...`；
  3. 数据调度页读取参数并自动触发一次带筛选的列表查询。

## 3. 架构与模块拆分
### 前端
- `TaskRanking.tsx`：负责映射与跳转。
- `data-schedule/index.tsx`：负责解析 URL 参数并应用筛选。
- `modules/mock.ts`：补齐 `taskStatus` 类型兼容字符串数组。

### 后端
- 无变更。

## 4. 文件规划
### 修改文件
- `frontend/src/pages/(base)/data-fetch/data-overview/modules/TaskRanking.tsx`
- `frontend/src/pages/(base)/data-fetch/data-schedule/index.tsx`
- `frontend/src/pages/(base)/data-fetch/data-schedule/modules/mock.ts`

## 5. 关键设计
- 分类映射：
  - `completed -> ['success']`
  - `running -> ['running']`
  - `remaining -> ['pending']`
  - `abnormal -> ['failed']`
- 自动应用策略：
  - 仅在列表模式（非 `mode=add/detail`）执行；
  - 仅首次进入时应用，避免覆盖用户后续手动筛选。

## 6. 测试方案
- 手工验证：
  - 在四个分类下分别点击按钮，检查 URL 与数据调度筛选值；
  - 校验 add/detail 模式不被触发自动筛选。

## 7. 风险
- `abnormal` 与数据调度状态集并非完全同构，当前按 `failed` 兜底映射。
