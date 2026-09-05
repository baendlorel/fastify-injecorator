import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

import { dirs } from './common/consts.js';

export function syncReadme(_who?: string) {
  const rootReadmePath = dirs.root.join('README.md');
  const rootReadme = readFileSync(rootReadmePath, 'utf-8');
  // Inside a sub-package (packages/<pkg>/README.md) the relative link must point
  // back to the repo root instead of ./README.zh.md.
  const subReadme = rootReadme.replaceAll('./README.zh.md', '../../README.zh.md');
  let count = 0;

  ['packages', 'plugins'].forEach((baseDir) => {
    const basePath = dirs.root.join(baseDir);
    if (!existsSync(basePath)) {
      return;
    }

    readdirSync(basePath, { withFileTypes: true }).forEach((entry) => {
      if (!entry.isDirectory()) {
        return;
      }

      const packagePath = basePath.join(entry.name);
      if (!existsSync(packagePath.join('package.json'))) {
        return;
      }

      const readmePath = packagePath.join('README.md');
      if (!existsSync(readmePath) || readFileSync(readmePath, 'utf-8') !== subReadme) {
        writeFileSync(readmePath, subReadme, 'utf-8');
      }
      count++;
    });
  });

  console.log(`Synced root README.md to ${count} sub-package(s).`);
  // Sub-package READMEs are gitignored and only exist for the npm tarball;
  // only the tracked root README is returned for the release commit.
  return [rootReadmePath];
}
