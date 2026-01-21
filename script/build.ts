import { build } from 'vite';
import { build as esbuild } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('Building client...');
await build({
  configFile: join(rootDir, 'vite.config.ts'),
});

console.log('Building server...');
await esbuild({
  entryPoints: [join(rootDir, 'server/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: join(rootDir, 'dist/index.cjs'),
  external: [
    'express',
    'passport',
    'passport-local',
    'express-session',
    'memorystore',
    '@supabase/supabase-js',
    'postgres',
    'drizzle-orm',
    'zod',
  ],
  banner: {
    js: `
const require = (await import("node:module")).createRequire(import.meta.url);
const __filename = (await import("node:url")).fileURLToPath(import.meta.url);
const __dirname = (await import("node:path")).dirname(__filename);
    `.trim(),
  },
});

const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const distPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  type: 'module',
  dependencies: packageJson.dependencies,
};

writeFileSync(
  join(rootDir, 'dist/package.json'),
  JSON.stringify(distPackageJson, null, 2)
);

console.log('Build complete!');
