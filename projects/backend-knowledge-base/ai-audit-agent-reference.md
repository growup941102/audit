# ai-audit-agent 参考知识库

## 1. 目的
用于沉淀 `gxxm/ai-audit-agent` 中可复用的数据库、接口状态口径和 Nacos 配置方式，便于当前 `audit` 项目后续对齐。

## 2. 代码入口
- 工程路径：`/Users/zyc/gxxm/ai-audit-agent`
- 状态接口 Controller：
  - `src/main/java/com/zznode/hcpsp/audit/controller/ProjectStatusController.java`
- 状态聚合 Service：
  - `src/main/java/com/zznode/hcpsp/audit/service/ProjectStatusQueryService.java`
- 关键 SQL：
  - `src/main/java/com/zznode/hcpsp/audit/dao/mapper/FilePrepareMapper.xml`
  - `src/main/java/com/zznode/hcpsp/audit/dao/mapper/TaskItemMapper.xml`
- Nacos 启动配置：
  - `src/main/resources/bootstrap.yml`

## 3. 状态接口口径
- `GET /admin/projects/status/summary`
  - 返回：`totalProjects/runningProjects/successProjects/failedProjects/pendingProjects`
- `GET /admin/projects/{projectId}/status`
  - 返回：项目状态、步骤、最新任务状态、错误信息、文件统计

状态判定核心逻辑（简化）：
- `RUNNING`：存在运行中文件或任务
- `SUCCESS`：非草稿文件全部达到成功步骤
- `PARTIAL_FAILED`：失败与成功混合
- `FAILED`：存在失败任务/文件
- `PENDING`：其余情况

## 4. 关联核心表
- `c_r_cm_project`
- `c_r_cm_file_prepare`
- `c_r_cm_task_item_queue`
- 常见扩展：`c_r_cm_sub_task_status`、`c_r_cm_file_lock`

## 5. Nacos 配置方式（Java）
`bootstrap.yml` 关键项：
- `spring.cloud.nacos.server-addr=${NACOS_HOST:...}`
- `spring.cloud.nacos.username/password`
- `spring.cloud.nacos.config.namespace/group/prefix/file-extension`
- `spring.cloud.nacos.config.shared-configs`
- `spring.cloud.nacos.discovery.namespace/group`

说明：
- Java 侧通过 Spring Cloud Alibaba 自动加载配置与刷新。
- 当前 `audit`（Django）暂无同等自动装配，若后续接 Python Nacos，建议保持 `namespace/group/dataId` 一致。

## 6. 对当前 audit 项目的落地建议
1. 优先复用 `ProjectStatusQueryService` 的状态口径，不复用 Java 代码实现细节。
2. 数据库连接参数先对齐环境变量命名（`MYSQL_HOST/MYSQL_PORT/MYSQL_USERNAME` 等）。
3. 失败日志统一落盘，保证接口失败可追踪（`backend/logs/api_failure.log`）。
4. 未接入真实数据源的接口不要再使用 mock 兜底，直接失败并记录日志。
