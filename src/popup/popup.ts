/**
 * Popup entrypoint — read-only crop status display.
 *
 * Reads `cropEnabled` from storage.local once when opened and reflects it.
 * It never writes state: the only way to toggle crop is the YouTube player
 * button. The popup closes when focus returns to YouTube, so a live
 * storage listener provides no practical benefit.
 */

import { canSendFeedbackMetadata, extensionApi } from '../platform/extension-api';
import { STORAGE_KEY } from '../storage/state';
import { buildFeedbackUrl, FEEDBACK_URL } from '../feedback';

declare const TARGET_BROWSER: 'chrome' | 'firefox';

const feedbackSource = TARGET_BROWSER === 'firefox'
    ? 'firefox-popup'
    : 'chrome-popup';

function setStatus(text: string, stateClass: string): void {
    const status = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    if (!status || !statusText) {
        return;
    }
    statusText.textContent = text;
    status.classList.remove('is-on', 'is-off', 'is-unavailable');
    status.classList.add(stateClass);
}

async function init(): Promise<void> {
    const version = extensionApi.runtime.getManifest().version;

    const versionEl = document.getElementById('version');
    if (versionEl) {
        versionEl.textContent = version;
    }

    const feedback = document.querySelector<HTMLAnchorElement>('#feedback');
    if (feedback) {
        feedback.href = await canSendFeedbackMetadata()
            ? buildFeedbackUrl(feedbackSource, version)
            : FEEDBACK_URL;
    }

    try {
        const result = await extensionApi.storage.local.get(STORAGE_KEY);
        if (result[STORAGE_KEY] === true) {
            setStatus('Crop is on', 'is-on');
        } else {
            setStatus('Crop is off', 'is-off');
        }
    } catch {
        setStatus('Status unavailable', 'is-unavailable');
    }
}

void init();
