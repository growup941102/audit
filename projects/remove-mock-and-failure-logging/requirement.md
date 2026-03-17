# 需求文档

## 1. 背景
- 当前前后端仍存在 mock 数据或兜底数据，会掩盖真实链路问题。
- 后端接口失败缺少统一可调用的失败日志入口。
- 需要把 `gxxm/ai-audit-agent` 的数据库/状态/Nacos 参考沉淀为可查知识。

## 2. 目标
- 移除前端假数据与后端 mock 兜底逻辑，不再“看起来正常”。
- 为后端接口失败补齐统一日志落盘与查询接口。
- 沉淀 `ai-audit-agent` 参考知识库。

## 3. 范围
### 本次范围
- 前端：
  - 移除 `data-schedule` 与 `choose-data` 模块 mock 数据。
  - 移除 `data-overview` 排名占位兜底。
- 后端：
  - 移除 data-schedule mock 兜底入口（未接入真实数据源时直接失败）。
  - 增加 API 失败日志中间件与日志查询接口。
- 文档：
  - 新增 `ai-audit-agent` 参考知识库。

### 不在本次范围
- 不新增 data-schedule 真实业务表查询实现。
- 不修改 `ai-audit-agent` 代码。

## 4. 功能需求
- [x] 前端 mock 数据移除后，未接入真实接口时直接报错。
- [x] 后端 mock 兜底移除后，未接入真实数据源时直接失败。
- [x] 后端接口失败统一记录到日志文件。
- [x] 提供失败日志查询接口。
- [x] 沉淀 `ai-audit-agent` 参考知识库文档。

## 5. 验收标准
- [x] `data-schedule/modules/mock.ts` 不再返回假数据。
- [x] `chooseDataMock.ts` 不再内置静态目录/项目数据。
- [x] data-schedule 后端 mock 入口不可用并报错。
- [x] `/api/admin/logs/api-failures/` 可读取失败日志。
- [x] 知识库新增 `ai-audit-agent-reference.md`。
