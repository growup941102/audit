# 页面接口文档：数据查询

## 1. 页面概览
- 页面路由：`/data-fetch/data-query`
- 页面入口：`frontend/src/pages/(base)/data-fetch/data-query/index.tsx`
- 页面模块：
  - `DataQuerySearch`：行业 + 项目名称搜索
  - `DataQueryTable`：行业维度字段透视表

## 2. 前端调用入口
- URL 常量：`frontend/src/service/urls/data-query.ts`
- API 封装：`frontend/src/service/api/data-query.ts`
- Hooks：`frontend/src/service/hooks/useDataQuery.ts`
- 类型定义：`frontend/src/service/types/data-query.d.ts`

## 3. 接口清单（按页面）

### 3.1 获取行业选项
- 路径：`GET /api/data-query/industries/`
- 鉴权：`IsAuthenticated`
- 请求参数：无
- 响应字段：
  - `[{ label, value }]`
- 说明：
  - 从 `c_r_cm_project.industry` 查询可用行业；
  - 仅返回当前支持的行业（`SW`/`JS`）；
  - 前端默认选第一个行业并自动触发透视查询。

### 3.2 获取行业透视列表
- 路径：`GET /api/data-query/industry-pivot/`
- 鉴权：`IsAuthenticated`
- 请求参数（query）：
  - `industry`：必填，支持 `SW`/`JS`
  - `projectName`：可选，项目名称模糊搜索
  - `current`：可选，页码，默认 `1`
  - `size`：可选，每页条数，默认 `10`，最大 `50`
- 响应字段：
  - `current` `size` `total`
  - `columns[]`：`{ key, title, fixed? }`
  - `records[]`：`{ projectId, projectName, <dynamicFieldKey>: string }`
- 说明：
  - `columns` 的动态字段来源于“数据调度详情”的字段名称；
  - `records` 按项目行展示，缺失值统一补 `--`。

## 4. 后端串联链路
1. 前端 `useDataQueryIndustries/useDataQueryIndustryPivot` 发起请求。
2. 路由 `backend/api/urls.py` 转到：
   - `get_data_query_industries`
   - `get_data_query_industry_pivot`
3. `views.py` 中 helper 处理：
   - `_build_data_query_industry_options`
   - `_parse_data_query_industry_pivot_filters`
   - `_build_data_query_industry_pivot_payload`
4. 透视字段构建复用数据调度能力：
   - `_get_data_schedule_industry_table_config`
   - `_build_data_schedule_field_rows`

## 5. 数据库与安全约束
- 读取表：
  - `c_r_cm_project`（行业、项目名）
  - `c_r_cm_kb_project_relation`（项目映射）
  - 详情行业表（按 `SW/JS` 配置自动选择）
- 安全约束：
  - 全流程只读 `SELECT`；
  - 使用参数化查询；
  - 不涉及 `INSERT/UPDATE/DELETE/DDL`。

## 6. 常见失败与排查
- `400 industry 参数不能为空`
  - 检查前端是否已选择默认行业。
- `400 industry 参数无效，仅支持 SW/JS`
  - 检查传参大小写或非法值。
- `500 数据查询列表加载失败，请检查数据库连接`
  - 查看 `backend/logs/api_failure.log`；
  - 检查数据库连接环境变量。
