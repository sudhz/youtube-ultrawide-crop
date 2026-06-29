/**
 * Build script - bundles src/index.ts -> dist/index.js.
 * Copies manifest.json, content.css, and icons/ into dist/.
 *
 * Usage:
 *   bun run build        one-shot production build (minified)
 *   bun run dev          watch mode (sourcemaps, unminified)
 */

import esbuild from 'esbuild';
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';

const isWatch = process.argv.includes('--watch');
const distDir = 'dist';

// Ensure output directories exist
mkdirSync(distDir, { recursive: true });

const buildOptions: esbuild.BuildOptions = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  outfile: `${distDir}/index.js`,
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  legalComments: 'none',
};

async function main(): Promise<void> {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes... (reload YouTube tab to test)');
  } else {
    await esbuild.build(buildOptions);
  }

  // Copy static assets
  cpSync('src/manifest.json', `${distDir}/manifest.json`);
  copyFileSync('src/content.css', `${distDir}/content.css`);
  if (existsSync('icons')) {
    rmSync(`${distDir}/icons`, { recursive: true, force: true });
    cpSync('icons', `${distDir}/icons`, { recursive: true });
  }

  console.log('Build complete -> dist/');
}

main();
