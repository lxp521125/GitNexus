const { execSync } = require('child_process');
const fs = require('fs');
const repos = ['publiccms-core', 'publiccms-trade', 'publiccms-oauth', 'publiccms-oss', 'publiccms-analyzer'];
const allRoutes = [];

for (const repo of repos) {
  try {
    const out = execSync(
      `node dist/cli/index.js cypher "MATCH (r:Route) RETURN r.name AS route, r.filePath AS file ORDER BY r.filePath, r.name" --repo ${repo}`,
      { encoding: 'utf8', timeout: 60000 }
    );
    const jsonMatch = out.match(/\{[\s\S]*?"row_count"\s*:\s*\d+/);
    if (jsonMatch) {
      const json = jsonMatch[0] + '}';
      const data = JSON.parse(json);
      if (data.markdown) {
        const lines = data.markdown.split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('route |'));
        for (const l of lines) {
          const parts = l.split('|').filter(p => p.trim());
          if (parts.length >= 2) {
            allRoutes.push({ module: repo, route: parts[0].trim(), file: parts[1].trim() });
          }
        }
      }
    }
  } catch (e) {
    console.error(repo + ' error: ' + e.message.slice(0, 200));
  }
}

let output = '';
let currentModule = '';
for (const r of allRoutes) {
  if (r.module !== currentModule) {
    currentModule = r.module;
    const moduleRoutes = allRoutes.filter(x => x.module === currentModule);
    output += `\n=== ${currentModule} (${moduleRoutes.length} routes) ===\n`;
  }
  output += `  ${r.route.padEnd(50)} ${r.file}\n`;
}

output += `\n=== Total: ${allRoutes.length} routes across ${repos.length} modules ===\n`;

console.log(output);
fs.writeFileSync('d:\\mycode\\GitNexus\\publiccms-all-routes.txt', output, 'utf8');
console.log('\nSaved to d:\\mycode\\GitNexus\\publiccms-all-routes.txt');
