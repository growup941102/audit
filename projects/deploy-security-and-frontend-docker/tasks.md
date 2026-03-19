# 任务文档

## 1. 准备阶段
- [x] 完成 `requirement.md`
- [x] 完成 `design.md`
- [x] 编码前获得用户确认

## 2. 安全整改任务
- [x] 替换 `.env` 中默认敏感值为占位符
- [x] 替换 `docker-compose.yml` 中默认敏感值为占位符
- [x] 登录文档中移除明文账号密码示例
- [x] 管理员初始化逻辑改为优先读取环境变量，缺省仅生成一次性随机密码

## 3. 前端容器化任务
- [x] 将前端 Dockerfile 改为多阶段生产构建
- [x] 新增 Nginx 配置并支持 `/api` 反向代理
- [x] 新增 `frontend/.env.prod`
- [x] 在 `docker-compose.yml` 新增前端服务

## 4. 验证
- [ ] `docker compose config` 配置检查通过
- [ ] `docker compose up -d --build` 启动验证通过
- [ ] 前端首页与后端健康检查可访问

## 5. 交付
- [x] 更新根 README 部署说明
- [ ] 等待用户在目标服务器执行并反馈结果
