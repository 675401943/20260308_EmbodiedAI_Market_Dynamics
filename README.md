# 四大板块深度研报

> 咖啡机器人 · SMT智慧工厂 · 机械臂 · 具身智能

网站地址：https://675401943.github.io/20260308_EmbodiedAI_Market_Dynamics/

## 当前协作分工

- Maxclaw：每天上传新的研报 `.md` 文件（建议放到 `reports/`）
- Codex：维护网页展示、归档逻辑与 GitHub Pages 部署流程

## 内容更新约定

1. 每日新增研报放到 `reports/` 目录
2. 文件名建议带日期：`YYYYMMDD_主题.md` 或 `YYYY-MM-DD_主题.md`
3. 文档第一行用 `# 标题`，用于网页展示标题

## 自动化流程（CI）

推送到 `main` 后，GitHub Actions 会自动：

1. 执行 `node scripts/generate-manifest.js`
2. 生成 `reports-manifest.json`
3. 部署静态站到 GitHub Pages

因此日常无需手动改网页代码，只传 `.md` 即可自动归档并联动日历。
