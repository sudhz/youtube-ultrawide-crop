type ExtensionApi = typeof chrome;

type GlobalWithBrowser = typeof globalThis & {
    browser?: ExtensionApi;
};

const globalWithBrowser = globalThis as GlobalWithBrowser;

export const extensionApi: ExtensionApi = globalWithBrowser.browser ?? chrome;

type FirefoxPermissions = chrome.permissions.Permissions & {
    data_collection?: string[];
};

declare const TARGET_BROWSER: 'chrome' | 'firefox';

export async function canSendFeedbackMetadata(): Promise<boolean> {
    if (TARGET_BROWSER === 'chrome') {
        return true;
    }
    try {
        const permissions = await extensionApi.permissions.getAll() as FirefoxPermissions;
        return permissions.data_collection?.includes('technicalAndInteraction') === true;
    } catch {
        return false;
    }
}
