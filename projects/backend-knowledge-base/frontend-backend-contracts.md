# 前后端契约说明

## 1. 目的
这份文档用于记录 React 前端与 Django 后端之间的主要契约点，方便后续需求在实现时减少反复确认成本。

## 2. 前端契约入口
- `frontend/src/service/api/system-manage.ts`
  - 封装系统设置相关请求
- `frontend/src/service/hooks/useSystemManage.ts`
  - 提供系统设置相关的 React Query Hooks
- `frontend/src/service/api/auth.ts`
  - 封装鉴权相关请求

## 3. 后端契约入口
- `backend/api/urls.py`
  - 定义后端接口路径
- `backend/api/views.py`
  - 负责参数解析、校验和响应拼装

## 4. 当前已识别的契约范围

### 鉴权相关
- 后端接口包括：
  - `/api/login/`
  - `/api/register/`
  - `/api/refresh-token/`
  - `/api/user-info/`
  - `/api/logout/`
  - `/api/captcha/`

### 系统管理相关
- 后端接口包括：
  - `/api/system-manage/website-settings/`
  - `/api/system-manage/website-settings/update/`
  - `/api/system-manage/website-settings/upload/`
  - `/api/system-manage/website-brand-settings/`
  - `/api/system-manage/website-brand-settings/update/`
  - `/api/system-manage/watermark-settings/`
  - `/api/system-manage/watermark-settings/update/`

- 同时还保留了一部分旧版兼容路径，例如：
  - `/api/systemManage/getWebsiteSettings`
  - `/api/systemManage/updateWebsiteSettings`
  - `/api/systemManage/getWatermarkSettings`

### 数据概览相关
- 后端接口包括：
  - `/api/admin/projects/status/summary/`
  - `/api/admin/projects/{projectId}/status/`
  - `/api/admin/projects/status/ranking/`
- 约定说明：
  - `summary` 用于概览 KPI（总数/运行中/成功/失败/待处理）。
  - `project status` 用于单项目状态详情（状态标签、步骤、错误、文件统计）。
  - `ranking` 用于概览 TOP20（按 `category` + 时间范围过滤）。

### 数据查询相关
- 后端接口包括：
  - `/api/data-query/industries/`
  - `/api/data-query/industry-pivot/`
- 约定说明：
  - 行业选项来自 `c_r_cm_project.industry`，前端默认取首项；
  - `industry-pivot` 返回 `columns + records` 动态结构；
  - `industry` 必填，仅支持 `SW/JS`；
  - 缺失字段值统一返回 `--`；
  - 本模块仅只读查询，不涉及写库。

### 失败日志相关
- 后端接口包括：
  - `/api/admin/logs/api-failures/`
- 约定说明：
  - 所有 `/api/` 路径接口失败会写入 `backend/logs/api_failure.log`。
  - 可通过日志接口按 `lines/keyword` 读取失败记录。

### 数据调度详情字段编辑相关
- 后端接口包括：
  - `PATCH /api/data-schedule/tasks/{taskId}/extract-result/fields/{fieldKey}/`
- 约定说明：
  - 字段是否可编辑由后端 `canEdit` 动态返回，前端只负责按该值控制按钮可用态。
  - 仅非受保护字段允许编辑，以下类型默认不可编辑：
    - 主键/关联键（例如 `id`、`project_id`、`prj_section_id`、`*_id`）；
    - 系统时间字段（如 `create_time`、`update_time` 等）。
  - PATCH 成功后，后端会执行真实数据库 `UPDATE`；前端刷新列表后应回读最新值。
  - 常见失败语义：
    - `400`：字段不支持编辑，字段缺少可更新的数据源信息，或更新目标不唯一；
    - `404`：字段不存在，或更新目标行不存在。

### 数据调度详情下钻行 CRUD 相关
- 后端接口包括：
  - `GET /api/data-schedule/tasks/{taskId}/extract-result/drilldown/?fieldKey=...`
  - `POST /api/data-schedule/tasks/{taskId}/extract-result/drilldown/rows/`
  - `PATCH /api/data-schedule/tasks/{taskId}/extract-result/drilldown/rows/{rowId}/`
  - `DELETE /api/data-schedule/tasks/{taskId}/extract-result/drilldown/rows/{rowId}/delete/?fieldKey=...`
- 约定说明：
  - 下钻返回中的 `actions` 由后端按可写条件动态计算，不再固定 false。
  - 下钻列中 `editable=true` 的字段才允许前端进入新增/编辑表单。
  - 新增/编辑/删除会执行真实数据库写入，并在写入前做命中范围校验：
    - 命中 0 行：返回“目标不存在”；
    - 命中多行：返回“目标不唯一，暂不支持编辑”。

## 5. 契约维护检查清单
- 后端字段名变化时，同步更新前端请求/响应类型定义。
- 后端路径变化时，同步更新前端 URL 常量与 service 封装。
- 鉴权头、Token 结构或刷新逻辑变化时，联调验证登录、刷新和受保护请求。
- 上传逻辑变化时，验证请求体格式、文件类型限制和返回字段。

## 6. 后续需求的文档补充清单
当一个需求同时影响前后端时，至少记录：
- 修改了哪个前端 service 文件
- 修改了哪个后端路由或视图文件
- 请求字段有哪些变化
- 响应字段有哪些变化
- 是否保留向后兼容
- 老路径或老字段是否还继续支持

## 7. 推荐工作顺序
1. 先完成 `requirement.md`。
2. 再完成 `design.md`。
3. 用户确认后再开始编码。
4. 前后端契约一起更新。
5. 同步补充便于前端开发者快速阅读的变更说明。
