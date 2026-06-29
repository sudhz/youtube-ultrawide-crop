type ExtensionApi = typeof chrome;

type GlobalWithBrowser = typeof globalThis & {
    browser?: ExtensionApi;
};

const globalWithBrowser = globalThis as GlobalWithBrowser;

export const extensionApi: ExtensionApi = globalWithBrowser.browser ?? chrome;
