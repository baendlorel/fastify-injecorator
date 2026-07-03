import fs from 'node:fs';
import './path-join.js';

export namespace dirs {
  export const root = import.meta.dirname.join('..', '..');
  export const rootPackageJson = root.join('package.json');
  export const packages = root.join('packages');

  /**
   * Actual package directories with `package.json` in it.
   */
  export const publishable = ['packages']
    .map((t) => {
      const p = root.join(t);
      const ls = fs.readdirSync(p);
      return ls.map((l) => p.join(l));
    })
    .flat()
    .filter((p) => p.join('package.json').existsOr());
}
