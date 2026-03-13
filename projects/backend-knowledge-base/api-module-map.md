# API 模块地图

## 1. 模块概览
当前项目的自定义后端逻辑主要集中在 `backend/api` 目录下。

## 2. 文件职责

### `backend/api/models.py`
- 定义持久化数据模型。
- 当前已观察到的核心模型：
  - `WebsiteSetting`
- 主要职责：
  - 存储站点品牌配置与水印相关配置

### `backend/api/views.py`
- 主要业务 API 实现文件。
- 当前包含的内容较多，主要包括：
  - 通用成功/失败响应封装
  - 登录与 Refresh Token 处理
  - 验证码生成与校验
  - 当前用户信息与登出接口
  - 站点设置、水印设置相关接口
  - 各类参数校验与辅助函数

### `backend/api/urls.py`
- 定义 API 路由并映射到具体视图函数。
- 同时保留了新路径和一部分旧版兼容路径。

### `backend/api/authentication.py`
- 基于 DRF TokenAuthentication 扩展了 `Bearer` 关键字支持。

### `backend/api/migrations/`
- 记录 `api` 应用的数据库结构演进历史。
- 从当前迁移文件可以看出，`WebsiteSetting` 与水印字段有过持续演进。

### `backend/api/management/commands/init_auth_data.py`
- 用于初始化鉴权相关种子数据。
- 对本地开发和初始环境启动比较有帮助。

## 3. 当前功能分区

### 鉴权相关
- 登录
- 注册
- Refresh Token
- 获取当前用户信息
- 登出

### 安全辅助能力
- 验证码生成与校验
- 登录失败计数与锁定策略

### 系统设置
- 站点设置
- 站点品牌设置
- 水印设置
- 站点资源上传

## 4. 当前耦合情况观察
- `views.py` 同时承担了接口层与不少辅助逻辑。
- 参数校验、文件处理、业务规则、响应拼装还没有明显拆到独立模块。
- 以当前规模来看还能维护，但后续需求增多时，建议逐步抽离：
  - `services/`
  - `serializers/`
  - `validators/`
  - `utils/`

## 5. 变更影响指南

### 如果修改 `models.py`
- 检查是否需要新增 migration。
- 检查 `views.py` 的响应字段是否需要同步调整。
- 检查前端 TypeScript 类型定义是否需要同步更新。

### 如果修改 `views.py`
- 检查 `urls.py` 是否需要同步调整。
- 检查前端 service 与 hooks 是否依赖当前字段或路径。
- 更新后端功能文档，让前端同学能快速理解本次变化。

### 如果修改 `urls.py`
- 检查前端 URL 常量和请求封装是否仍然匹配。
- 确认是否需要保留旧版兼容路径。

### 如果修改鉴权行为
- 检查前端登录流程。
- 检查 Token 刷新流程。
- 检查用户信息获取与路由守卫行为。

