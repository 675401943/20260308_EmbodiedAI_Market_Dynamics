# reports 目录约定（已加限制）

Maxclaw 只需要把新的研报 Markdown 放到本目录，CI 会自动校验。

## 1) 文件名规范（必需）

- `YYYYMMDD_topic.md` 或 `YYYY-MM-DD_topic.md`
- 示例：`20260309_embodied_ai_daily.md`

## 2) Frontmatter 规范（必需）

每个文件顶部必须包含：

```yaml
---
title: "具身智能日报：2026-03-09"
date: "2026-03-09"
sector: "embodied_ai"
source_count: 5
---
```

`sector` 允许值：

- `coffee_robot`
- `smt_factory`
- `robotic_arm`
- `embodied_ai`

## 3) 质量门槛（CI 自动校验）

- 正文需包含一级标题：`# 标题`
- 正文字数（中英文折算）>= 600
- `source_count` 必须是整数且 >= 3
- 正文中唯一来源链接数需 >= `source_count`
- 同一天同一板块最多 2 篇

## 4) 自动化流程

推送后 GitHub Actions 会自动：

1. 执行 `node scripts/validate-reports.js`（不通过即阻断部署）
2. 执行 `node scripts/generate-manifest.js`
3. 部署 GitHub Pages
