const { execSync } = require('child_process');

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function main() {
  const event = process.env.GITHUB_EVENT_NAME || '';
  if (event !== 'pull_request') {
    console.log(`Skip PR scope check for event: ${event || 'unknown'}`);
    return;
  }

  const baseRef = process.env.GITHUB_BASE_REF;
  const baseSha = process.env.GITHUB_BASE_SHA;
  if (!baseRef && !baseSha) {
    console.error('Missing GITHUB_BASE_REF/GITHUB_BASE_SHA in pull_request event.');
    process.exit(1);
  }

  const diffBase = baseSha || `origin/${baseRef}`;
  const output = run(`git diff --name-only --diff-filter=ACMR ${diffBase}...HEAD`);
  const changed = output ? output.split('\n').filter(Boolean) : [];

  const ALLOW_EXACT = new Set([
    '.github/workflows/validate-reports.yml',
    '.github/workflows/auto-merge-maxclaw.yml',
    'README.md',
    'scripts/validate-pr-scope.js',
    'scripts/validate-reports.js',
  ]);
  const disallowed = changed.filter(
    (p) => !p.startsWith('reports/') && !ALLOW_EXACT.has(p)
  );
  if (disallowed.length > 0) {
    console.error('PR scope validation failed. Only files under reports/** are allowed in PRs.');
    for (const file of disallowed) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }

  console.log(`PR scope validation passed (${changed.length} changed files).`);
}

main();
