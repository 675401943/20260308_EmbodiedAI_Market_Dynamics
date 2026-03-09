const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'reports');

const SECTORS = new Set([
  'coffee_robot',
  'smt_factory',
  'robotic_arm',
  'embodied_ai',
  'all',
]);

const DATE_PREFIX_RE = /^((?:19|20)\d{2}[-_]?(?:0[1-9]|1[0-2])[-_]?(?:0[1-9]|[12]\d|3[01]))_.+\.md$/;
const DATE_FMT_RE = /^(?:19|20)\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;

function walkMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];

  function walk(cur) {
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.toLowerCase().endsWith('.md')) continue;
      const rel = path.relative(ROOT, full).split(path.sep).join('/');
      if (rel.toLowerCase() === 'reports/readme.md') continue;
      files.push({ full, rel, base: path.basename(full) });
    }
  }

  walk(dir);
  return files.sort((a, b) => a.rel.localeCompare(b.rel));
}

function parseFrontmatter(content) {
  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    return { meta: null, body: content };
  }

  const normalized = content.replace(/\r\n/g, '\n');
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) {
    return { meta: null, body: content };
  }

  const block = normalized.slice(4, end);
  const body = normalized.slice(end + 5);
  const meta = {};

  for (const line of block.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }

  return { meta, body };
}

function countWords(text) {
  const asciiWords = (text.match(/[A-Za-z0-9_]+/g) || []).length;
  const cjkChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return asciiWords + cjkChars;
}

function extractLinks(text) {
  const links = text.match(/https?:\/\/[^\s)]+/g) || [];
  return [...new Set(links.map((x) => x.replace(/[.,;!?]+$/, '')))];
}

function main() {
  const files = walkMarkdownFiles(REPORTS_DIR);
  const errors = [];
  const perDaySectorCount = new Map();

  for (const file of files) {
    const content = fs.readFileSync(file.full, 'utf8');

    if (!DATE_PREFIX_RE.test(file.base)) {
      errors.push(`${file.rel}: 文件名必须以日期开头，格式示例 YYYYMMDD_topic.md 或 YYYY-MM-DD_topic.md`);
    }

    const { meta, body } = parseFrontmatter(content);
    if (!meta) {
      errors.push(`${file.rel}: 缺少 frontmatter，需以 --- 开头并包含必填字段`);
      continue;
    }

    for (const key of ['title', 'date', 'sector', 'source_count']) {
      if (!meta[key] || String(meta[key]).trim() === '') {
        errors.push(`${file.rel}: frontmatter 缺少必填字段 ${key}`);
      }
    }

    if (meta.date && !DATE_FMT_RE.test(meta.date)) {
      errors.push(`${file.rel}: date 必须为 YYYY-MM-DD`);
    }

    if (meta.sector && !SECTORS.has(meta.sector)) {
      errors.push(`${file.rel}: sector 非法，允许值：${[...SECTORS].join(', ')}`);
    }

    const sourceCount = Number(meta.source_count);
    if (!Number.isInteger(sourceCount) || sourceCount < 3) {
      errors.push(`${file.rel}: source_count 必须是整数且 >= 3`);
    }

    const links = extractLinks(body);
    if (Number.isInteger(sourceCount) && links.length < sourceCount) {
      errors.push(`${file.rel}: 实际唯一来源链接数(${links.length})少于 source_count(${sourceCount})`);
    }

    const words = countWords(body);
    if (words < 600) {
      errors.push(`${file.rel}: 正文内容过短，当前约 ${words} 字，要求 >= 600`);
    }

    if (!/^#\s+.+/m.test(body)) {
      errors.push(`${file.rel}: 正文需包含一级标题（# 标题）`);
    }

    if (meta.date && meta.sector) {
      const key = `${meta.date}::${meta.sector}`;
      const cur = perDaySectorCount.get(key) || 0;
      perDaySectorCount.set(key, cur + 1);
    }
  }

  for (const [key, count] of perDaySectorCount.entries()) {
    if (count > 2) {
      const [date, sector] = key.split('::');
      errors.push(`频率限制: ${date} ${sector} 共 ${count} 篇，超过上限 2 篇/天`);
    }
  }

  if (errors.length > 0) {
    console.error('Report validation failed:');
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(`Report validation passed (${files.length} files in reports/)`);
}

main();
