const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUTPUT_FILE = path.join(ROOT, 'reports-manifest.json');
const SCAN_DIRS = ['reports', '.'];
const IGNORE_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts']);

function isMarkdown(filename) {
  return filename.toLowerCase().endsWith('.md');
}

function shouldSkipMarkdown(relPath) {
  const lower = path.basename(relPath).toLowerCase();
  if (lower === 'readme.md') {
    return true;
  }
  return false;
}

function inferDate(fileName, statMtime) {
  const matched = fileName.match(/((?:19|20)\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/);
  if (matched) {
    return `${matched[1]}-${matched[2]}-${matched[3]}`;
  }
  const d = new Date(statMtime);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function extractTitle(content, fallbackName) {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^#\s+(.+)/);
    if (m) {
      return m[1].trim();
    }
  }
  return fallbackName;
}

function scanDir(dirRel, seen, out) {
  const startDir = path.join(ROOT, dirRel);
  if (!fs.existsSync(startDir)) {
    return;
  }

  function walk(absDir) {
    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    for (const entry of entries) {
      const absPath = path.join(absDir, entry.name);
      const relPath = path.relative(ROOT, absPath).split(path.sep).join('/');

      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) {
          continue;
        }
        walk(absPath);
        continue;
      }

      if (!entry.isFile() || !isMarkdown(entry.name)) {
        continue;
      }

      if (shouldSkipMarkdown(relPath) || seen.has(relPath)) {
        continue;
      }

      const stat = fs.statSync(absPath);
      const content = fs.readFileSync(absPath, 'utf8');
      const baseName = path.basename(entry.name, path.extname(entry.name));
      const title = extractTitle(content, baseName);
      const date = inferDate(entry.name, stat.mtime);

      out.push({
        title,
        path: relPath,
        date,
      });
      seen.add(relPath);
    }
  }

  walk(startDir);
}

function main() {
  const seen = new Set();
  const reports = [];

  for (const dir of SCAN_DIRS) {
    scanDir(dir, seen, reports);
  }

  reports.sort((a, b) => {
    if (a.date === b.date) {
      return a.path.localeCompare(b.path);
    }
    return b.date.localeCompare(a.date);
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    total: reports.length,
    reports,
  };

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Generated ${OUTPUT_FILE} (${reports.length} reports)`);
}

main();
