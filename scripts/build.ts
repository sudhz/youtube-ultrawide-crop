/**
 * Build script - bundles src/index.ts for Chrome and Firefox.
 *
 * Outputs:
 *   dist-chrome/   Chrome Web Store package root
 *   dist-firefox/  Firefox AMO package root with Gecko metadata
 *
 * Usage:
 *   bun run build        one-shot production build (minified)
 *   bun run dev          watch mode (sourcemaps, unminified)
 */

import esbuild from 'esbuild';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const isWatch = process.argv.includes('--watch');

const firefoxSettings = {
  browser_specific_settings: {
    gecko: {
      id: '{082d94be-e62f-42ae-a3de-bb47787b5e3a}',
      strict_min_version: '128.0',
      data_collection_permissions: {
        required: ['none'],
      },
    },
  },
};

type BuildTarget = {
  name: string;
  distDir: string;
  esbuildTarget: string;
  firefoxManifest: boolean;
};

const targets: BuildTarget[] = [
  {
    name: 'Chrome',
    distDir: 'dist-chrome',
    esbuildTarget: 'chrome120',
    firefoxManifest: false,
  },
  {
    name: 'Firefox',
    distDir: 'dist-firefox',
    esbuildTarget: 'firefox128',
    firefoxManifest: true,
  },
];

function copyStatic(target: BuildTarget): void {
  mkdirSync(target.distDir, { recursive: true });

  const manifest = JSON.parse(readText('src/manifest.json')) as Record<string, unknown>;
  if (target.firefoxManifest) {
    Object.assign(manifest, firefoxSettings);
  }
  writeFileSync(
    `${target.distDir}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  copyFileSync('src/content.css', `${target.distDir}/content.css`);
  if (existsSync('icons')) {
    rmSync(`${target.distDir}/icons`, { recursive: true, force: true });
    cpSync('icons', `${target.distDir}/icons`, { recursive: true });
  }
}

function readText(path: string): string {
  return readFileSync(path, 'utf8');
}

function buildOptions(target: BuildTarget): esbuild.BuildOptions {
  return {
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'iife',
    target: target.esbuildTarget,
    outfile: `${target.distDir}/index.js`,
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    legalComments: 'none',
  };
}

async function main(): Promise<void> {
  for (const target of targets) {
    mkdirSync(target.distDir, { recursive: true });
    copyStatic(target);
  }

  if (isWatch) {
    for (const target of targets) {
      const ctx = await esbuild.context(buildOptions(target));
      await ctx.watch();
    }
    console.log('Watching Chrome and Firefox builds... (reload YouTube tab to test)');
    return;
  }

  for (const target of targets) {
    await esbuild.build(buildOptions(target));
  }

  console.log('Build complete -> dist-chrome/ and dist-firefox/');
}

main();
