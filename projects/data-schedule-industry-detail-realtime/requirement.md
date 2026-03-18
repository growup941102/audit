# 需求文档

## 1. 背景
- 业务背景：数据调度详情页当前仍是 mock 结构，无法按行业（SW/JS）读取真实业务表。
- 当前现状：
  - 任务信息与数据详情接口未与行业业务表打通；
  - 字段展示未按“字段注释作为字段名称”；
  - 下钻“查看”仍非行业真实查询。
- 相关页面/模块：
  - 前端：`frontend/src/pages/(base)/data-fetch/data-schedule/modules/ScheduleDetailView.tsx`
  - 后端：`backend/api/views.py`、`backend/api/urls.py`

## 2. 目标
- 核心目标：实现数据调度详情的行业化真实查询（SW/JS），并提供任务信息 detail 接口。
- 预期价值：保证详情展示与行业库表一致，支持关键字段下钻核验。

## 3. 范围
### 本次范围
- 新增任务详情接口（detail）。
- `fields` 接口按 industry 分流读取真实表并去重输出。
- `drilldown` 接口按行业规则查真实表。
- 前端详情页任务信息区改用新 detail 接口。

### 不在本次范围
- 不新增前端复杂交互样式。
- 不实现下钻数据编辑持久化。

## 4. 用户故事
- 作为 `数据审核人员`，我希望 `在详情页看到行业真实字段与可下钻数据`，从而 `快速核验任务结果可信度`。

## 5. 功能需求
- [x] 需求 1：新增 `GET /api/data-schedule/tasks/{taskId}/detail/`。
- [x] 需求 2：SW 行业读取
  - `c_r_cm_engineering_sw_water_affairs_project_info`
  - `c_r_cm_engineering_sw_water_affairs_prj_section`
  并按注释输出字段、去重。
- [x] 需求 3：JS 行业读取
  - `c_r_cm_engineering_js_general_project_info`
  - `c_r_cm_engineering_js_general_prj_section`
  并按注释输出字段、去重。
- [x] 需求 4：特殊字段改造
  - “招标代理机构ID” -> “招标代理机构”，值为“查看”；
  - 按行业增加“评标专家信息 / 中标候选人公示 / 开标人员信息”等查看项。
- [x] 需求 5：下钻真实查询
  - SW：`tender_agent` / `expert_info` / `bid_submission`
  - JS：`bid_submission(agent_id)` / `expert_info` / `opening_attendee`

## 6. 非功能需求
- 性能：字段与下钻接口支持分页。
- 安全性：仅认证用户可访问。
- 兼容性：保持现有详情页主体结构。
- 可维护性：通过动态表结构读取，减少硬编码字段。

## 7. 数据与接口影响
- 前端影响：详情页 summary 数据来源改为 detail 接口。
- 后端影响：新增 detail 接口，重做 fields/drilldown 数据来源。
- 数据库影响：只读查询行业业务表，无写入。
- 第三方/MCP 影响：无。

## 8. 交互与界面说明
- 可抽离的组件机会：维持现有组件结构，优先改 service/hook。
- 需要覆盖的状态：加载中 / 空态 / 异常 / 成功。

## 9. 验收标准
- [ ] SW/JS 两类项目可正确返回行业字段。
- [ ] 字段名称优先使用列注释。
- [ ] 去重后字段列表无重复脏数据。
- [ ] 指定“查看”字段可打开下钻并返回真实表数据。
- [ ] 详情页任务信息区来自新 detail 接口。

## 10. 风险与疑问
- 风险：业务表字段命名可能存在环境差异（如 agent_id / prj_section_id）。
- 疑问：若“招标代理机构ID”注释不一致，是否以列名 `agent_id` 为准（本次按该策略兜底）。

## 11. 确认关卡
- 用户已在会话中明确给出详细实现规则，本次直接进入编码阶段。
