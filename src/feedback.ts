/**
 * Shared feedback links and URL builder.
 *
 * The popup and background entry points both use these to open the same
 * Tally form with a `source` label and the extension version.
 */

export const FEEDBACK_URL = 'https://tally.so/r/Y5vaDJ';

type FeedbackSource =
    | 'chrome-popup'
    | 'firefox-popup'
    | 'chrome-uninstall'
    | 'firefox-uninstall';

/**
 * Append `source` and `version` as hidden query params to the Tally form URL.
 * Tally surfaces matching hidden fields only when the form is opened with
 * these exact parameter names.
 */
export function buildFeedbackUrl(source: FeedbackSource, version: string): string {
    const params = new URLSearchParams({
        source,
        version,
    });
    return `${FEEDBACK_URL}?${params.toString()}`;
}
