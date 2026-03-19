# 设计文档

## 1. 概述
- 对应需求文档：
  `projects/data-query-export-and-schedule-detail-export-fix/requirement.md`
- 设计目标：
  以最小改动为原则补齐数据查询导出能力，并移除数据调度详情导出的“操作”列。

## 2. 方案摘要
- 前端方案：
  在数据查询搜索区域新增导出按钮，调用新的导出 API，沿用数据调度下载流程（fetch + blob + Content-Disposition）。
- 后端方案：
  1. 新增 `GET /api/data-query/industry-pivot/export/`。
  2. 新增数据查询导出二进制构建函数，复用透视数据构建逻辑并应用导出样式。
  3. 主表中 `招标代理机构/评标专家信息/开标人员信息` 三列输出“查看”并链接到对应下钻 sheet。
  4. 调整数据调度导出构建函数，移除字段详情与下钻 sheet 的“操作”列。
- 数据流转：
  筛选参数 -> 后端构建 xlsx -> 前端下载。

## 3. 架构与模块拆分
### 前端
- 页面/容器：
  - `data-query/index.tsx`
  - `data-query/modules/DataQuerySearch.tsx`
- Hooks / Services：
  - `frontend/src/service/api/data-query.ts`
  - `frontend/src/service/urls/data-query.ts`
  - `frontend/src/service/types/data-query.d.ts`

### 后端
- Django App：`backend/api`
- Views / API：`backend/api/views.py` + `backend/api/urls.py`
- Models/Migrations：无。

## 4. 文件规划
### 修改文件
- `backend/api/urls.py`：注册数据查询导出路由。
- `backend/api/views.py`：新增数据查询导出构建与接口；修改数据调度导出列。
- `backend/api/tests/test_data_query_industry_pivot.py`：补充导出构建相关测试。
- `frontend/src/service/urls/data-query.ts`：新增导出 URL。
- `frontend/src/service/types/data-query.d.ts`：新增导出参数类型。
- `frontend/src/service/api/data-query.ts`：新增导出请求函数。
- `frontend/src/pages/(base)/data-fetch/data-query/modules/DataQuerySearch.tsx`：增加导出按钮。
- `frontend/src/pages/(base)/data-fetch/data-query/index.tsx`：接入导出行为。

## 5. 接口设计
- 接口地址：`/api/data-query/industry-pivot/export/`
- 请求方法：`GET`
- 请求参数：
  - `industry`（必填，SW/JS）
  - `projectName`（可选）
- 响应结构：
  - 文件流（xlsx）
  - Header 含 `Content-Disposition`
- 异常处理：
  - 400：参数错误
  - 500：导出失败（依赖缺失/数据库异常）

## 6. 数据模型设计
- 无新增持久化模型。
- 导出文件字段来自透视列 `columns` + `records`。

## 7. 状态与交互设计
- 初始状态：按钮可用（需有行业）。
- 用户操作：点击导出 -> loading -> 下载文件 -> 成功/失败提示。
- 边界场景：
  - 未选择行业：按钮禁用。
  - 无数据：导出仅表头（或空行）。

## 8. 复用与封装设计
- 复用数据调度中的文件名解析与 blob 下载模式。
- 数据查询后端复用现有 `_build_data_query_industry_pivot_payload`，避免重复 SQL。

## 9. 文档计划
- 在本需求目录沉淀需求/设计/任务。
- 暂不新增长期知识库文档（仅功能增强，接口位置明确）。

## 10. MCP 与外部依赖
- 是否需要 MCP：否。
- 使用目的：无。
- 预期输入/输出：无。

## 11. 测试方案
- 后端：运行 `backend/api/tests/test_data_query_industry_pivot.py`。
- 前端：运行类型检查或构建（环境允许时）。
- 手工：验证导出按钮下载成功、字段正确、数据调度导出不含“操作”列。

## 12. 风险
- 技术风险：openpyxl 依赖缺失会导致导出失败。
- 回滚/兜底：保留原接口和页面查询流程，导出失败时提示。
