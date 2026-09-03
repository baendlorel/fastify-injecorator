import path from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';

const root = import.meta.dirname;

/**
 * Custom Vite plugin to resolve tsconfig path aliases.
 * vitest 4's built-in resolve.alias with RegExp entries doesn't work properly
 * for path-based aliases (e.g. @core/xxx), so we use a resolveId hook instead.
 *
 * Only @core/ is needed here — source code inside core uses it for internal imports.
 * Tests should use @nestify-js/core etc. (resolved via workspace node_modules).
 */
function tsconfigPathsPlugin(): Plugin {
  const mappings: Record<string, string> = {
    '@core/': path.resolve(root, 'packages/core/src/'),
    '@tests/': path.resolve(root, 'tests/'),
  };

  return {
    name: 'vite-plugin-tsconfig-paths',
    enforce: 'pre',
    async resolveId(source, importer, ctx) {
      for (const [prefix, replacement] of Object.entries(mappings)) {
        if (source.startsWith(prefix)) {
          // Use path.join to properly concatenate the replacement with the remaining path
          const remaining = source.slice(prefix.length);
          const resolved = path.join(replacement, remaining);
          return await this.resolve(resolved, importer, { skipSelf: true });
        }
      }
    },
  };
}

export default defineConfig({
  test: {
    include: ['**/*.{test,spec,e2e-spec}.?(c|m)[jt]s?(x)'],
  },
  plugins: [tsconfigPathsPlugin()],
  resolve: {
    alias: [
      // Workspace package entry points (string-based, these work fine)
      { find: '@nestify-js/shared', replacement: path.resolve(root, 'packages/shared/src/index.ts') },
      { find: '@nestify-js/core', replacement: path.resolve(root, 'packages/core/src/index.ts') },
      { find: '@nestify-js/swagger', replacement: path.resolve(root, 'packages/swagger/src/index.ts') },
    ],
  },
});

// '@nestify-js/shared/': path.resolve(root, 'packages/shared/src/'),
// '@nestify-js/swagger/': path.resolve(root, 'packages/swagger/src/'),
// '@nestify-js/core/': path.resolve(root, 'packages/core/src/'),
