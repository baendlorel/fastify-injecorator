import fs from 'node:fs';
import { execSync } from 'node:child_process';

import { getPackageInfo, syncRootVersion, PackageInfo } from './package-info.js';
import { dirs } from './common/consts.js';

export function build(who: string | undefined) {
  const group = getPackageInfo(who);
  syncRootVersion(group);
  group.forEach(buildWithInfo);
}

const config = dirs.root.join('tsdown.config.ts');

export function buildWithInfo(info: PackageInfo) {
  console.log(`Building package: ${info.name}`);

  const dist = info.path.join('dist').existsOr();
  if (dist) {
    fs.rmSync(dist, { recursive: true, force: true });
  }

  if (info.json.scripts?.build !== undefined) {
    execSync(`pnpm --filter ${info.name} run build`, { cwd: info.path, stdio: 'inherit', env: info.env });
    return;
  }

  const actualConfig = info.path.join('tsdown.config.ts').existsOr(config);
  execSync(`tsdown --config-loader tsx --config ${actualConfig.safe()}`, {
    stdio: 'inherit',
    cwd: info.path,
    env: info.env,
  });
}
