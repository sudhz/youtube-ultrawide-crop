/**
 * Background entrypoint — registers the uninstall survey URL.
 *
 * The extension has no other background responsibilities. This runs once
 * when the service worker (Chrome) or background script (Firefox) starts,
 * and re-runs on each wake, keeping the uninstall URL current for the
 * installed version. It only embeds a `source` label and the extension
 * version — no user identifiers.
 */

import { canSendFeedbackMetadata, extensionApi } from '../platform/extension-api';
import { buildFeedbackUrl, FEEDBACK_URL } from '../feedback';

declare const TARGET_BROWSER: 'chrome' | 'firefox';

const source = TARGET_BROWSER === 'firefox'
    ? 'firefox-uninstall'
    : 'chrome-uninstall';

async function registerUninstallUrl(): Promise<void> {
    const version = extensionApi.runtime.getManifest().version;
    const url = await canSendFeedbackMetadata()
        ? buildFeedbackUrl(source, version)
        : FEEDBACK_URL;
    const registration = extensionApi.runtime.setUninstallURL(url) as unknown as Promise<void>;
    await registration;
}

function refreshUninstallUrl(): void {
    void registerUninstallUrl().catch(() => {
        // Temporary Firefox installs may not support an uninstall URL.
    });
}

refreshUninstallUrl();

if (TARGET_BROWSER === 'firefox') {
    extensionApi.permissions.onAdded.addListener(refreshUninstallUrl);
    extensionApi.permissions.onRemoved.addListener(refreshUninstallUrl);
}
