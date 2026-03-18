# 设计文档

## 1. 概述
- 对应需求文档：`projects/data-schedule-list-api-design/requirement.md`
- 设计目标：在不新增表结构的前提下，设计可支撑数据调度列表页面的真实查询接口，搜索条件与当前页面保持一致。

## 2. 方案摘要
- 前端方案（后续接入）：
  - `fetchScheduleList` 调用新增列表接口；
  - 保持现有搜索表单字段不变，仅在请求层做时间区间参数规整。
- 后端方案：
  - 新增 `GET /api/data-schedule/tasks/`；
  - 复用与任务状况同源的核心表做聚合查询；
  - 按查询参数动态拼接筛选条件。
- 数据流转：
  1. 页面提交搜索条件；
  2. 后端聚合项目/任务快照并映射列表字段；
  3. 返回分页记录供列表渲染。

## 3. 架构与模块拆分
### 前端
- 复用：`data-schedule/index.tsx` + `ScheduleSearch.tsx`
- 后续改动点：`frontend/src/pages/(base)/data-fetch/data-schedule/modules/mock.ts` 的 `fetchScheduleList` 切换真实请求

### 后端
- `backend/api/urls.py`：新增列表路由
- `backend/api/views.py`：新增
  - 参数解析函数（状态、时间、区间）
  - 列表查询函数（SQL + 聚合）
  - 列表接口函数（返回分页结构）

## 4. 文件规划
### 新增/修改（实现阶段）
- `backend/api/urls.py`：新增 `data-schedule/tasks/`
- `backend/api/views.py`：新增列表 API 与查询逻辑
- `frontend/src/service/urls/data-schedule.ts`：新增列表 URL（实现阶段）
- `frontend/src/service/api/data-schedule.ts`：新增列表请求（实现阶段）

## 5. 接口设计

### 5.1 列表接口
- 接口地址：`GET /api/data-schedule/tasks/`
- 鉴权：`IsAuthenticated`
- 请求参数（query）：
  - `current`：页码，默认 `1`
  - `size`：每页条数，默认 `10`，建议最大 `100`
  - `projectName`：项目名称，模糊匹配
  - `taskStatus`：执行状态，多值（支持 `taskStatus=a&taskStatus=b`）
  - `creator`：创建人，多值（支持 `creator=a&creator=b`）
  - `matchRangeMin`：匹配度下限（0-100）
  - `matchRangeMax`：匹配度上限（0-100）
  - `createStartTime`：创建时间起（`YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss`）
  - `createEndTime`：创建时间止（同上，日期型按当日 23:59:59 处理）

### 5.2 响应结构
```json
{
  "code": "0000",
  "msg": "获取成功",
  "data": {
    "current": 1,
    "size": 10,
    "total": 125,
    "records": [
      {
        "id": 1,
        "taskId": "PROJECT:3400000000834944",
        "projectName": "机场三期配套道路...",
        "taskStatus": "running",
        "progress": 62,
        "creator": "zhangsan",
        "createTime": "2026-03-11 10:12:36",
        "completeTime": "2026-03-18 09:35:11",
        "createBy": "system",
        "updateBy": "system",
        "updateTime": "2026-03-18 09:35:11",
        "status": null
      }
    ]
  }
}
```

### 5.3 状态映射设计（列表 taskStatus）
- 基础映射（与任务状况口径一致）：
  - `RUNNING -> running`
  - `SUCCESS -> success`
  - `PENDING -> pending`
  - `FAILED/PARTIAL_FAILED -> failed`
- 扩展映射（若任务快照存在原始状态）：
  - `PAUSED -> paused`
  - `CANCELLED/STOPPED -> stopped`

## 6. 查询与库表设计

### 6.1 复用核心表
- `c_r_cm_project`：项目基础信息（项目名、可能的创建人/创建时间）
- `c_r_cm_file_prepare`：文件执行统计（进度与状态判定）
- `c_r_cm_task_item_queue`：任务队列快照（最新状态、更新时间、任务标识）

### 6.2 聚合思路
1. 先按项目聚合文件统计，得到进度与失败/成功分布。
2. 再取每个项目最新任务快照（同 `summary/ranking` 现有口径）。
3. 组装列表记录：
   - `taskId`：最新任务 `resource_id`（或项目级任务标识）
   - `taskStatus`：状态映射结果
   - `progress`：建议按 `step3SuccessFiles / nonDraftFiles * 100`（无非草稿时 0）
   - `completeTime`：终态任务更新时间（无则 `null`）
4. 最后应用筛选与分页。

### 6.3 筛选规则
- `projectName`：`LIKE %keyword%`
- `taskStatus`：映射后状态 `IN (...)`
- `creator`：创建人 `IN (...)`
- `matchRange`：`progress BETWEEN min AND max`
- `createTime`：`createTime BETWEEN start AND end`

## 7. 参数校验与错误处理
- `taskStatus` 非法值：`400` + 明确可选值
- `matchRangeMin/Max` 非数字或越界：`400`
- `matchRangeMin > matchRangeMax`：`400`
- `createStartTime > createEndTime`：`400`
- 时间格式非法：`400`

## 8. 排序与分页
- 默认排序：`createTime DESC, taskId DESC`
- 分页：标准 `current/size/total/records`

## 9. 与当前页面搜索条件对齐说明
- 页面 `createTime` 是日期区间组件，本接口采用 `createStartTime/createEndTime`，由前端请求层完成映射。
- 页面 `taskStatus/creator` 是多选，本接口支持重复 query key。
- 页面 `matchRangeMin/matchRangeMax` 直接透传。

## 10. 测试方案（实现后）
- 接口参数组合测试：单条件/多条件/边界条件。
- 状态映射测试：覆盖 running/success/pending/failed/paused/stopped。
- 分页测试：total 与 records 数量一致。
- 与数据概览口径对比：同时间窗口下总量趋势一致。

## 11. 风险
- 真实库字段差异（如 `creator/create_time`）可能导致实现期需调整 SQL 字段映射。
- `progress` 的业务口径若需改为“匹配度”独立算法，需补充计算来源。
