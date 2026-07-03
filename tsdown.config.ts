import './scripts/common/path-join.js';
import { defineConfig } from 'tsdown';
import funcMacro from 'rollup-plugin-func-macro';
import { replacePlugin } from './scripts/replace.js';

const isDev = process.env.NODE_ENV === 'development';
const lib = process.env.LIB_DIR!;
const root = import.meta.dirname;
const packDir = root.join('packages');

export default defineConfig({
  entry: [{ index: lib.join('src', 'index.ts') }], // { cli: 'src/cli/index.ts' }
  format: ['esm', 'cjs'],
  deps: {
    neverBundle: ['cron-parser'],
  },
  tsconfig: root.join('tsconfig.build.json'),
  dts: true,
  sourcemap: false,
  alias: {
    '@shared/': packDir.join('_shared'),
    '@core/': packDir.join('src'),
    '@schema/': packDir.join('schema'),
    '@swagger/': packDir.join('swagger'),
    '@tests/': packDir.join('tests'),
  },
  minify: true,
  plugins: [replacePlugin(), funcMacro()],
});
