import { join } from 'node:path';
import { defineConfig } from 'tsdown';
import funcMacro from 'rollup-plugin-func-macro';
// @ts-ignore
import { replacePlugin } from '../../scripts/replace.js';

const packDir = import.meta.dirname;
const root = join(packDir, '..', '..');

console.log('Using core/tsdown.config.ts');

export default defineConfig({
  cwd: packDir,
  entry: [{ index: join('src', 'index.ts') }],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  deps: {
    neverBundle: ['cron-parser', /^fastify/, /^@fastify/, /^@nestify\//],
  },
  tsconfig: join(root, 'tsconfig.build.json'),
  dts: true,
  sourcemap: false,
  alias: {
    '@core/': join(root, 'packages', 'core', 'src'),
    '@schema/': join(root, 'packages', 'schema', 'src'),
    '@swagger/': join(root, 'packages', 'swagger', 'src'),
    '@tests/': join(root, 'packages', 'tests'),
  },
  minify: false,
  plugins: [replacePlugin(), funcMacro()],
});
