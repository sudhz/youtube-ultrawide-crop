/**
 * State — crop on/off persisted in chrome.storage.local.
 */

const STORAGE_KEY = 'cropEnabled';

let cropEnabled = false;

export function isEnabled(): boolean {
    return cropEnabled;
}

export async function loadState(): Promise<void> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    cropEnabled = result[STORAGE_KEY] === true;
}

function saveState(): void {
    chrome.storage.local.set({ [STORAGE_KEY]: cropEnabled });
}

export function toggleCrop(): void {
    cropEnabled = !cropEnabled;
    saveState();
}

export function onStorageChange(
    cb: () => void,
): void {
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') {
            return;
        }
        const change = changes[STORAGE_KEY];
        if (change) {
            const nextEnabled = change.newValue === true;
            if (cropEnabled === nextEnabled) {
                return;
            }
            cropEnabled = nextEnabled;
            cb();
        }
    });
}