/** Package the source tree into a ZIP for AMO source submission. */

import { zipSync } from 'fflate';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Force UTC so fflate's local-time date methods produce consistent timestamps.
process.env.TZ = 'UTC';

const SOURCE_PATHS = [
    'src',
    'scripts',
    'icons',
    'package.json',
    'bun.lock',
    'tsconfig.json',
    'README.md',
    'PRIVACY.md',
    'LICENSE',
];

const FIXED_DATE = new Date(Date.UTC(1980, 0, 1));

function collectFiles(dir: string, prefix: string): Record<string, Uint8Array> {
    const files: Record<string, Uint8Array> = {};
    for (const name of readdirSync(dir)) {
        const fullPath = join(dir, name);
        const entryName = `${prefix}/${name}`;
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            Object.assign(files, collectFiles(fullPath, entryName));
        } else if (stat.isFile()) {
            files[entryName] = readFileSync(fullPath);
        }
    }
    return files;
}

function main(): void {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { name: string; version: string };
    const outFile = `artifacts/${pkg.name}-v${pkg.version}-source.zip`;

    const files: Record<string, Uint8Array> = {};
    for (const path of SOURCE_PATHS) {
        if (!existsSync(path)) {
            throw new Error(`Source path not found: ${path}`);
        }
        const stat = statSync(path);
        if (stat.isDirectory()) {
            Object.assign(files, collectFiles(path, path));
        } else {
            files[path] = readFileSync(path);
        }
    }

    const zipped = zipSync(files, { level: 6, mtime: FIXED_DATE, os: 0 });
    mkdirSync('artifacts', { recursive: true });
    writeFileSync(outFile, zipped);
    console.log(`Packaged ${outFile}`);
}

if (import.meta.main) {
    main();
}
