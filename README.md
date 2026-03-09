# 四大板块深度研报

> 咖啡机器人 · SMT智慧工厂 · 机械臂 · 具身智能

网站地址：https://675401943.github.io/20260308_EmbodiedAI_Market_Dynamics/

## 当前协作分工

- Maxclaw：每天上传新的研报 `.md` 文件到 `reports/`
- Codex：维护网页展示、归档逻辑与 GitHub Pages 部署流程

## 内容更新约定

1. 每日新增研报放到 `reports/` 目录
2. 文件名必须带日期：`YYYYMMDD_topic.md` 或 `YYYY-MM-DD_topic.md`
3. 每个文档必须包含 frontmatter：`title/date/sector/source_count`
4. 正文需有一级标题，且满足最小质量门槛（见 `reports/README.md`）
5. `sector` 支持四个单板块值以及 `all`（四大板块合并日报）

## 自动化流程（CI）

推送到 `main` 后，GitHub Actions 会自动：

1. 执行 `node scripts/validate-reports.js`
2. 执行 `node scripts/generate-manifest.js`
3. 生成 `reports-manifest.json`
4. 部署静态站到 GitHub Pages

`validate` 失败会阻断部署，因此 Maxclaw 只需按模板提交 `.md`。
