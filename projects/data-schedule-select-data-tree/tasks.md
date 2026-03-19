# 任务文档

## 1. 文档
- [x] requirement.md
- [x] design.md
- [x] tasks.md

## 2. 后端
- [x] 新增 select-data 接口路由
- [x] 新增 root_path 查询与解析逻辑
- [x] 新增树结构构建与去重逻辑
- [x] 新增“新增部分”反向过滤规则（industry 非空 + 无 file_prepare 或无项目级队列）

## 3. 前端
- [x] 新增 select-data URL/API/Hook/类型
- [x] 新建调度页接入真实选择数据接口
- [x] 保留原有弹窗交互并替换数据源

## 4. 验证
- [x] python compileall
- [x] frontend typecheck
- [x] frontend eslint(目标文件)
- [x] 只读查库确认反向规则命中范围（当前环境为空集合）
