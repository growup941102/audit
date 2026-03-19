# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-query-industry-pivot/requirement.md`
- 设计目标：实现数据查询页的“行业维度列式透视”查询能力，并严格遵循 TDD + safe-sql 只读门禁。

## 2. 方案摘要
- 前端方案：
  - `data-query` 页面改为“搜索区 + 动态表格”；
  - 首次加载行业选项，默认选第一个并触发查询；
  - 表格动态列由接口返回 `columns` 驱动。
- 后端方案：
  - 新增行业列表接口（只读）；
  - 新增透视查询接口（只读）：按行业+项目名筛选项目，返回动态字段列与项目行数据；
  - 字段来源复用数据调度详情字段构造逻辑，保证口径一致。
- 数据流转：
  1. 页面加载 -> 拉行业列表；
  2. 默认选第一个行业 -> 拉透视数据；
  3. 用户输入项目名称并查询 -> 更新透视数据；
  4. 表格按 `columns + records` 渲染。

## 3. 架构与模块拆分
### 前端
- 页面/容器：
  - `data-query/index.tsx`（页面容器）
- 可复用组件：
  - `DataQuerySearch`（搜索区）
  - `DataQueryTable`（动态表格）
- Hooks / Services：
  - `service/api/data-query.ts`
  - `service/hooks/useDataQuery.ts`
  - `service/types/data-query.d.ts`
  - `service/urls/data-query.ts`

### 后端
- Django App：`backend/api`
- Views / API：
  - `get_data_query_industry_options`
  - `get_data_query_industry_pivot`
- Models：不新增。
- Migrations：无。

## 4. 文件规划
### 新增文件
- `frontend/src/service/urls/data-query.ts`：数据查询 URL 常量。
- `frontend/src/service/api/data-query.ts`：数据查询接口封装。
- `frontend/src/service/hooks/useDataQuery.ts`：React Query hooks。
- `frontend/src/service/types/data-query.d.ts`：数据查询类型定义。
- `frontend/src/pages/(base)/data-fetch/data-query/modules/DataQuerySearch.tsx`：搜索组件。
- `frontend/src/pages/(base)/data-fetch/data-query/modules/DataQueryTable.tsx`：动态表格组件。
- `backend/api/tests/test_data_query_industry_pivot.py`：后端 TDD 测试。
- `projects/data-query-industry-pivot/{requirement,design,tasks}.md`：需求文档。

### 修改文件
- `frontend/src/pages/(base)/data-fetch/data-query/index.tsx`：接入真实查询页面。
- `frontend/src/service/api/index.ts`：导出 data-query API。
- `frontend/src/service/hooks/index.ts`：导出 data-query hooks。
- `frontend/src/service/urls/index.ts`：导出 data-query URLs。
- `frontend/src/service/keys/index.ts`：新增 data-query query keys。
- `backend/api/views.py`：新增数据查询相关 helper 与接口。
- `backend/api/urls.py`：挂载数据查询接口路由。
- `projects/backend-knowledge-base/page-api-index.md`：新增“数据查询”页索引。

## 5. 接口设计

### 5.1 获取行业选项
- 接口地址：`GET /api/data-query/industries/`
- 请求方法：GET
- 请求参数：无
- 响应结构：
  - `records[]`: `{ label: string, value: string }`
- 异常处理：数据库不可用时返回 500。

### 5.2 获取行业透视数据
- 接口地址：`GET /api/data-query/industry-pivot/`
- 请求方法：GET
- 请求参数：
  - `industry`: string（必填）
  - `projectName`: string（可选，模糊匹配）
  - `current`: number（默认 1）
  - `size`: number（默认 10，最大 50）
- 响应结构：
  - `current` / `size` / `total`
  - `columns[]`: `{ key: string, title: string, fixed?: 'left' }`
  - `records[]`: `[{ projectId, projectName, <dynamicFieldKey>: fieldValue }]`
- 异常处理：
  - 参数错误返回 400；
  - 查询异常返回 500。

## 6. 数据模型设计
- 核心来源：
  - `c_r_cm_project.industry`（行业筛选）
  - `c_r_cm_project.project_name`（项目名筛选）
  - `c_r_cm_kb_project_relation`（项目映射）
  - 行业详情表（通过现有 `_get_data_schedule_industry_table_config` 定位）
- 透视生成规则：
  - 行业下项目集合 -> 每个项目生成字段列表；
  - `columns` 为所有项目字段名并集（按首次出现顺序）；
  - `records` 每行填充项目对应字段值，缺失补 `--`。

## 7. 状态与交互设计
- 初始状态：加载行业列表并默认查询首行业。
- 用户操作：
  - 切换行业 -> 自动查询；
  - 输入项目名称点击查询 -> 按条件查询。
- 边界场景：
  - 无行业选项 -> 搜索禁用 + 空态；
  - 无结果 -> 空态；
  - 某项目映射缺失 -> 该项目字段全 `--` 或跳过（实现时明确）。

## 8. 复用与封装设计
- 需要抽离的组件：搜索区、动态表格。
- 需要抽离的公共工具：
  - 后端透视构建 helper（字段并集与行填充）；
  - 前端动态列生成工具（若表格列处理复杂）。
- 为什么需要封装：
  - 动态列逻辑与查询条件管理复杂，拆分后更易维护和测试。

## 9. 文档计划
- 需要补充的后端文档：
  - `projects/backend-knowledge-base/page-api-data-query.md`（新增）
  - `page-api-index.md` 增加数据查询页。
- 面向前端同学的说明：
  - `industry` 默认值来源；
  - `columns` 动态列渲染约定；
  - 空值显示规则。

## 10. MCP 与外部依赖
- 是否需要 MCP：否（当前方案可通过本地代码与只读 SQL完成）。
- 使用目的：无。
- 预期输入/输出：无。
- safe-sql 约束落地：
  - 本期只执行 `SELECT`；
  - 不触发写库二次确认流程。

## 11. 测试方案
- 后端验证（TDD）：
  - RED：先写行业列表与透视接口失败测试；
  - GREEN：实现最小代码通过测试；
  - REFACTOR：抽离 helper 并保持测试全绿。
- 前端验证：
  - 行业默认选中与自动查询；
  - 项目名称筛选；
  - 动态列渲染与空态。
- 手工验证：
  - 选择行业、输入项目名、查询，核对表头字段是否与数据调度详情字段口径一致。

## 12. 风险
- 技术风险：
  - 动态列较多导致前端横向渲染压力。
- 回滚/兜底方案：
  - 若透视列过多，可降级为分页字段列（后续迭代）；
  - 保留后端超时保护与分页限制。
