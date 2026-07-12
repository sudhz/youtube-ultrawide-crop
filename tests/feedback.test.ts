import { describe, expect, it } from 'bun:test';
import { buildFeedbackUrl, FEEDBACK_URL } from '../src/feedback';

describe('buildFeedbackUrl', () => {
    it('builds popup URL with source and version', () => {
        const url = buildFeedbackUrl('chrome-popup', '1.1.0');
        const parsed = new URL(url);
        expect(parsed.origin + parsed.pathname).toBe(FEEDBACK_URL);
        expect(parsed.searchParams.get('source')).toBe('chrome-popup');
        expect(parsed.searchParams.get('version')).toBe('1.1.0');
    });

    it('builds chrome-uninstall URL', () => {
        const url = buildFeedbackUrl('chrome-uninstall', '1.1.0');
        const parsed = new URL(url);
        expect(parsed.searchParams.get('source')).toBe('chrome-uninstall');
        expect(parsed.searchParams.get('version')).toBe('1.1.0');
    });

    it('builds firefox-uninstall URL', () => {
        const url = buildFeedbackUrl('firefox-uninstall', '2.0.0');
        const parsed = new URL(url);
        expect(parsed.searchParams.get('source')).toBe('firefox-uninstall');
        expect(parsed.searchParams.get('version')).toBe('2.0.0');
    });

    it('always starts with the Tally form URL', () => {
        const url = buildFeedbackUrl('firefox-popup', '1.1.0');
        expect(url.startsWith(FEEDBACK_URL)).toBe(true);
    });
});
