# 设计文档

## 1. 概述
- 对应需求文档：`/Users/zyc/gxxm/audit/projects/interface-docs-by-page/requirement.md`
- 设计目标：建立“按页面查接口文档”的索引 + 单页面样例，作为后续扩展标准。

## 2. 方案摘要
- 前端方案：无代码改动，仅记录前端调用入口（URL/API/Hook/页面组件）。
- 后端方案：无代码改动，仅记录路由、视图函数、SQL来源与状态逻辑。
- 数据流转：文档化呈现“页面 -> 前端请求 -> 后端路由 -> 视图逻辑 -> 数据表”链路。

## 3. 架构与模块拆分
### 前端
- 页面/容器：记录页面路由及模块组件。
- 可复用组件：不新增。
- Hooks / Services：记录现有调用链位置。

### 后端
- Django App：`backend/api`（只读说明）。
- Views / API：记录现有函数入口与参数校验逻辑。
- Models：不新增。
- Migrations：不涉及。

## 4. 文件规划
### 新增文件
- `/Users/zyc/gxxm/audit/projects/interface-docs-by-page/requirement.md`
- `/Users/zyc/gxxm/audit/projects/interface-docs-by-page/design.md`
- `/Users/zyc/gxxm/audit/projects/interface-docs-by-page/tasks.md`
- `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/page-api-index.md`
- `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/page-api-data-overview.md`

### 修改文件
- `/Users/zyc/gxxm/audit/projects/backend-knowledge-base/README.md`

## 5. 接口设计
- 接口地址：不新增，仅文档化已有接口。
- 请求方法：沿用现有实现。
- 请求参数：沿用现有实现。
- 响应结构：沿用现有实现。
- 异常处理：沿用现有实现，文档中补充常见失败场景。

## 6. 数据模型设计
- 表/模型：不新增，仅记录读取来源。
- 字段：不新增。
- 约束：不涉及。

## 7. 状态与交互设计
- 初始状态：通过总索引进入页面文档。
- 用户操作：按页面查接口，再按接口看参数和逻辑。
- 边界场景：页面含多个模块时，先按模块分组再列接口。

## 8. 复用与封装设计
- 需要抽离的组件：不涉及前端组件。
- 需要抽离的公共工具：先以文档模板约束，后续再评估脚本生成。
- 为什么需要封装：统一写法，保证新增页面文档结构一致。

## 9. 文档计划
- 需要补充的后端文档：新增页面接口总索引 + 数据概览页文档。
- 需要新增的功能文档：接口编写示例模板（嵌入页面文档）。
- 面向前端同学的说明：优先提供“前端入口文件 + 参数 + 返回字段”。

## 10. MCP 与外部依赖
- 是否需要 MCP：否。
- 使用目的：不涉及。
- 预期输入/输出：不涉及。

## 11. 测试方案
- 前端验证：不涉及。
- 后端验证：不涉及。
- 手工验证：检查文档链接、文件路径、接口字段与代码一致性。

## 12. 风险
- 技术风险：低，主要风险为后续维护不及时。
- 回滚/兜底方案：若目录不合适，可调整链接与命名，不影响业务逻辑。

