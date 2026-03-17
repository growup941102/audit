# 需求文档

## 1. 背景
- 业务背景：`data-overview` 页面当前使用前端硬编码假数据，无法反映真实项目执行状态。
- 当前现状：
  - 参考项目 `gxxm/ai-audit-agent` 已有项目状态聚合接口：
    - `GET /admin/projects/status/summary`
    - `GET /admin/projects/{projectId}/status`
  - 当前项目后端尚未提供对应能力，前端 `KpiCards`、`TaskRanking` 未接真实数据。
- 相关页面/模块：
  - `frontend/src/pages/(base)/data-fetch/data-overview/`
  - `backend/api/views.py`
  - `backend/api/urls.py`

## 2. 目标
- 核心目标：将数据概览页面从假数据切换为数据库实时查询结果，并参考 `ai-audit-agent` 的状态口径。
- 预期价值：
  - 让概览数据可用于真实运营/联调判断；
  - 与参考项目状态语义一致，降低跨项目理解成本；
  - 为后续继续接入 Nacos 配置读取打基础（本期先做数据库与接口）。

## 3. 范围
### 本次范围
- 后端新增只读接口（参考 `ai-audit-agent`）：
  - `GET /api/admin/projects/status/summary/`
  - `GET /api/admin/projects/<projectId>/status/`
- 为概览排名新增接口：
  - `GET /api/admin/projects/status/ranking/`
- 前端数据概览接入真实接口：
  - KPI 卡片改为 summary 接口；
  - 排名列表改为 ranking 接口。
- 数据库连接配置兼容增强：
  - 支持 `MYSQL_HOST/MYSQL_PORT/MYSQL_USERNAME` 环境变量别名。

### 不在本次范围
- 不做数据库写操作。
- 不改参考项目 `ai-audit-agent` 的代码。
- 不在本期引入 Python 端 Nacos 强依赖 SDK（后续单独需求推进）。

## 4. 用户故事
- 作为 `系统使用者`，我希望 `数据概览页面展示真实项目状态与排名`，从而 `快速掌握运行情况并定位异常`。

## 5. 功能需求
- [ ] 需求 1：提供项目状态汇总接口，返回总数/运行中/成功/失败/待处理。
- [ ] 需求 2：提供单项目状态明细接口，返回状态、步骤、错误与文件统计。
- [ ] 需求 3：提供项目状态排名接口，支持按分类与时间范围筛选。
- [ ] 需求 4：前端 KPI 卡片使用 summary 实时数据。
- [ ] 需求 5：前端 TOP20 排名使用 ranking 实时数据。
- [ ] 需求 6：数据库配置支持更多兼容变量名。

## 6. 非功能需求
- 性能：概览接口应在常规数据量下快速响应。
- 安全性：接口仅允许认证用户访问；查询为只读。
- 兼容性：前端沿用现有 `request` 封装与 Query 体系。
- 可维护性：新增 `data-overview` 的 service/hooks/types 分层。

## 7. 数据与接口影响
- 前端影响：
  - 新增 `data-overview` 的 URL/API/Hook/Type。
  - 修改 `KpiCards.tsx`、`TaskRanking.tsx` 数据来源。
- 后端影响：
  - `views.py` 增加项目状态聚合与排名查询函数。
  - `urls.py` 增加 3 条路由。
  - `settings.py` 增加数据库环境变量别名兼容。
- 数据库影响：只读查询 `c_r_cm_project`、`c_r_cm_file_prepare`、`c_r_cm_task_item_queue`。
- 第三方/MCP 影响：无新增 MCP 依赖。

## 8. 交互与界面说明
- 保持现有 UI 结构不变，仅替换数据源。
- 排名保持 “完成/运行/剩余/异常” 四分类展示逻辑。

## 9. 验收标准
- [ ] 进入数据概览页后 KPI 数值来自后端接口而非硬编码。
- [ ] 切换排名分类后列表由后端返回并展示 Top20。
- [ ] 时间范围变化可触发后端查询并更新列表。
- [ ] 单项目状态接口可返回有效数据，项目不存在返回 404。
- [ ] 无写库 SQL 执行。

## 10. 风险与疑问
- 风险：
  - 若目标库缺失参考表，接口可能返回空数据或报错。
  - 项目量较大时，全量状态聚合可能带来查询压力。
- 疑问：
  - 排名“剩余”是否固定对应 `PENDING`，后续是否需要“待处理+暂停”等可配置映射。

## 11. 确认关卡
- 用户已确认优先推进“数据库参考调整”，本期进入实现阶段。
