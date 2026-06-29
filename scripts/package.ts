/**
 * Package script - creates a Chrome Web Store ready ZIP from dist/.
 * The ZIP root contains manifest.json, index.js, content.css, and icons/.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, sep } from 'node:path';

const distDir = 'dist';
const artifactsDir = 'artifacts';

type PackageJson = {
  name?: string;
  version?: string;
};

type ZipEntry = {
  name: string;
  data: Buffer;
  crc: number;
  dosTime: number;
  dosDate: number;
  offset: number;
};

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]!;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date): { dosTime: number; dosDate: number } {
  const year = Math.max(1980, date.getFullYear());
  return {
    dosTime:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    dosDate:
      ((year - 1980) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  };
}

function collectFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...collectFiles(path));
    } else if (stat.isFile()) {
      files.push(path);
    }
  }
  return files;
}

function localHeader(entry: ZipEntry): Buffer {
  const name = Buffer.from(entry.name, 'utf8');
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(10, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(entry.dosTime, 10);
  header.writeUInt16LE(entry.dosDate, 12);
  header.writeUInt32LE(entry.crc, 14);
  header.writeUInt32LE(entry.data.length, 18);
  header.writeUInt32LE(entry.data.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name]);
}

function centralHeader(entry: ZipEntry): Buffer {
  const name = Buffer.from(entry.name, 'utf8');
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(10, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(entry.dosTime, 12);
  header.writeUInt16LE(entry.dosDate, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(entry.data.length, 20);
  header.writeUInt32LE(entry.data.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.offset, 42);
  return Buffer.concat([header, name]);
}

function endOfCentralDirectory(
  entryCount: number,
  centralSize: number,
  centralOffset: number,
): Buffer {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(entryCount, 8);
  header.writeUInt16LE(entryCount, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(centralOffset, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

function createZip(sourceDir: string, outFile: string): void {
  const now = dosDateTime(new Date());
  const entries: ZipEntry[] = collectFiles(sourceDir)
    .map((path) => {
      const data = readFileSync(path);
      return {
        name: relative(sourceDir, path).split(sep).join('/'),
        data,
        crc: crc32(data),
        dosTime: now.dosTime,
        dosDate: now.dosDate,
        offset: 0,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const fileParts: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    entry.offset = offset;
    const header = localHeader(entry);
    fileParts.push(header, entry.data);
    offset += header.length + entry.data.length;
  }

  const centralOffset = offset;
  const centralParts = entries.map(centralHeader);
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);

  writeFileSync(
    outFile,
    Buffer.concat([
      ...fileParts,
      ...centralParts,
      endOfCentralDirectory(entries.length, centralSize, centralOffset),
    ]),
  );
}

if (!existsSync(`${distDir}/manifest.json`)) {
  throw new Error('dist/manifest.json not found. Run `bun run build` first.');
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as PackageJson;
const name = packageJson.name ?? 'youtube-ultrawide-crop';
const version = packageJson.version ?? '0.0.0';
const outFile = `${artifactsDir}/${name}-v${version}.zip`;

mkdirSync(artifactsDir, { recursive: true });
createZip(distDir, outFile);

console.log(`Packaged ${outFile}`);
