/**
 * Build script — bundles src/ for Chrome and Firefox.
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
import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const isWatch = process.argv.includes('--watch');
const packageJson = JSON.parse(readText('package.json')) as { version: string };

// Only accept three-part numeric versions like 1.2.3.
const VERSION_RE = /^\d+\.\d+\.\d+$/;
if (!VERSION_RE.test(packageJson.version)) {
  throw new Error(
    `package.json version "${packageJson.version}" must match ^\\d+\\.\\d+\\.\\d+$`,
  );
}

const firefoxSettings = {
  background: {
    scripts: ['background.js'],
  },
  browser_specific_settings: {
    gecko: {
      id: '{082d94be-e62f-42ae-a3de-bb47787b5e3a}',
      strict_min_version: '140.0',
      data_collection_permissions: {
        required: ['none'],
        optional: ['technicalAndInteraction'],
      },
    },
  },
};

type BuildTarget = {
  browser: 'chrome' | 'firefox';
  distDir: string;
  esbuildTarget: string;
};

const targets: BuildTarget[] = [
  {
    browser: 'chrome',
    distDir: 'dist-chrome',
    esbuildTarget: 'chrome120',
  },
  {
    browser: 'firefox',
    distDir: 'dist-firefox',
    esbuildTarget: 'firefox140',
  },
];

/** Remove a dist directory so stale files can't survive in a package. */
function cleanDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function copyStatic(target: BuildTarget): void {
  const manifest = JSON.parse(readText('src/manifest.json')) as Record<string, unknown>;
  manifest.version = packageJson.version;
  if (target.browser === 'firefox') {
    Object.assign(manifest, firefoxSettings);
  }
  writeFileSync(
    `${target.distDir}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  copyFileSync('src/content.css', `${target.distDir}/content.css`);
  copyFileSync('src/popup/popup.html', `${target.distDir}/popup.html`);
  copyFileSync('src/popup/popup.css', `${target.distDir}/popup.css`);
  rmSync(`${target.distDir}/icons`, { recursive: true, force: true });
  cpSync('icons', `${target.distDir}/icons`, { recursive: true });
}

function readText(path: string): string {
  return readFileSync(path, 'utf8');
}

function buildOptions(target: BuildTarget): esbuild.BuildOptions {
  return {
    entryPoints: ['src/index.ts', 'src/popup/popup.ts', 'src/background/background.ts'],
    bundle: true,
    format: 'iife',
    entryNames: '[name]',
    target: target.esbuildTarget,
    outdir: target.distDir,
    minify: !isWatch,
    sourcemap: isWatch ? 'inline' : false,
    legalComments: 'none',
    define: {
      TARGET_BROWSER: JSON.stringify(target.browser),
    },
  };
}

async function main(): Promise<void> {
  // Clean once at startup — not on every watch rebuild.
  for (const target of targets) {
    cleanDir(target.distDir);
  }

  for (const target of targets) {
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
