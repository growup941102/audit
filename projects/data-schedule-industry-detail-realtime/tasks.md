# 任务文档

## 1. 准备阶段
- [x] 完成 `requirement.md`
- [x] 完成 `design.md`
- [x] 编码前获得用户确认

## 2. 后端任务
- [x] 新增 detail 接口路由与视图
- [x] 实现 taskId -> file_prepare_project_id/industry 解析
- [x] 实现 `file_prepare_project_id -> c_r_cm_kb_project_relation.project_id(kb_project_id)` 映射解析
- [x] 实现 SW/JS 字段聚合与去重
- [x] 实现特殊“查看”字段注入
- [x] 实现 SW/JS drilldown 真实查询
- [x] 兼容导出逻辑与真实下钻数据

## 3. 前端任务
- [x] 新增 detail API/Hook/类型
- [x] 详情页任务信息区切到 detail 接口

## 4. 验证
- [x] python compileall
- [x] frontend typecheck
- [x] frontend eslint(目标文件)
- [x] 只读查库验证 relation 映射链路可命中 SW/JS 业务表

## 5. 交付
- [x] 总结改动与联调说明
