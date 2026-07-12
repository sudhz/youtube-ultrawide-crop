import { describe, expect, it, beforeAll } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

type Manifest = {
    version: string;
    permissions: string[];
    background?: {
        service_worker?: string;
        scripts?: string[];
    };
    browser_specific_settings?: {
        gecko?: {
            id?: string;
            strict_min_version?: string;
            data_collection_permissions?: {
                required?: string[];
                optional?: string[];
            };
        };
    };
    icons?: Record<string, string>;
    action?: {
        default_popup?: string;
        default_icon?: Record<string, string>;
    };
};

function readManifest(dir: string): Manifest {
    return JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) as Manifest;
}

function readPackageVersion(): string {
    return (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version;
}

// These tests run after `bun run build` produces dist-chrome and dist-firefox.
// The `validate` script runs build before tests.
describe('generated build output', () => {
    const chrome = readManifest('dist-chrome');
    const firefox = readManifest('dist-firefox');
    const pkgVersion = readPackageVersion();

    it('both manifests use the package version', () => {
        expect(chrome.version).toBe(pkgVersion);
        expect(firefox.version).toBe(pkgVersion);
    });

    it('storage is the only permission', () => {
        expect(chrome.permissions).toEqual(['storage']);
        expect(firefox.permissions).toEqual(['storage']);
    });

    it('Chrome uses a service worker', () => {
        expect(chrome.background?.service_worker).toBe('background.js');
        expect(chrome.background?.scripts).toBeUndefined();
    });

    it('Chrome has no Gecko settings', () => {
        expect(chrome.browser_specific_settings).toBeUndefined();
    });

    it('Firefox uses background scripts', () => {
        expect(firefox.background?.scripts).toEqual(['background.js']);
        expect(firefox.background?.service_worker).toBeUndefined();
    });

    it('Firefox retains its Gecko UUID', () => {
        const gecko = firefox.browser_specific_settings?.gecko;
        expect(gecko?.id).toBe('{082d94be-e62f-42ae-a3de-bb47787b5e3a}');
    });

    it('Firefox targets version 140', () => {
        expect(firefox.browser_specific_settings?.gecko?.strict_min_version).toBe('140.0');
    });

    it('Firefox declares feedback metadata as optional technical data', () => {
        const data = firefox.browser_specific_settings?.gecko?.data_collection_permissions;
        expect(data?.required).toEqual(['none']);
        expect(data?.optional).toEqual(['technicalAndInteraction']);
    });

    it('Chrome background.js contains chrome-uninstall source', () => {
        const bg = readFileSync(join('dist-chrome', 'background.js'), 'utf8');
        expect(bg).toContain('chrome-uninstall');
        expect(bg).not.toContain('firefox-uninstall');
    });

    it('Firefox background.js contains firefox-uninstall source', () => {
        const bg = readFileSync(join('dist-firefox', 'background.js'), 'utf8');
        expect(bg).toContain('firefox-uninstall');
        expect(bg).not.toContain('chrome-uninstall');
    });

    it('Chrome popup.js contains chrome-popup source', () => {
        const popup = readFileSync(join('dist-chrome', 'popup.js'), 'utf8');
        expect(popup).toContain('chrome-popup');
        expect(popup).not.toContain('firefox-popup');
    });

    it('Firefox popup.js contains firefox-popup source', () => {
        const popup = readFileSync(join('dist-firefox', 'popup.js'), 'utf8');
        expect(popup).toContain('firefox-popup');
        expect(popup).not.toContain('chrome-popup');
    });

    it('all manifest-referenced files exist in dist-chrome', () => {
        const files = [
            chrome.background?.service_worker,
            'content.css',
            'popup.html',
            'popup.css',
            'popup.js',
            'index.js',
            ...(Object.values(chrome.icons ?? {})),
            ...(Object.values(chrome.action?.default_icon ?? {})),
        ].filter(Boolean) as string[];
        for (const f of files) {
            expect(existsSync(join('dist-chrome', f))).toBe(true);
        }
    });

    it('all manifest-referenced files exist in dist-firefox', () => {
        const files = [
            ...(firefox.background?.scripts ?? []),
            'content.css',
            'popup.html',
            'popup.css',
            'popup.js',
            'index.js',
            ...(Object.values(firefox.icons ?? {})),
            ...(Object.values(firefox.action?.default_icon ?? {})),
        ].filter(Boolean) as string[];
        for (const f of files) {
            expect(existsSync(join('dist-firefox', f))).toBe(true);
        }
    });
});
