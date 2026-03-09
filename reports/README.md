# reports 目录约定

Maxclaw 每日只需要把新的研报 Markdown 放到本目录。

## 文件命名建议

- 推荐包含日期：`YYYYMMDD_主题.md` 或 `YYYY-MM-DD_主题.md`
- 示例：`20260309_embodied_ai_daily.md`

## 页面自动纳入规则

- GitHub Actions 部署前会自动执行 `scripts/generate-manifest.js`
- 脚本会扫描 `reports/` 和仓库根目录下的 `.md` 文件
- 文件名包含日期时，页面会按该日期归档并在日历中高亮
- 标题优先取 Markdown 第一行 `# 标题`
