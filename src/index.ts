/**
 * YouTube Ultrawide Crop
 *
 * Adds a crop button to the YouTube player that zooms the video to fill
 * the player, removing letterboxing. The toggle persists in
 * chrome.storage.local across videos, refreshes, and navigation.
 */

import { loadState, onStorageChange } from './storage/state';
import { updateButton } from './player/button';
import { applyCrop } from './player/crop';
import { getPlayer } from './player/dom';
import {
    applyCropAndSync,
    applyCropNow,
    onVideoMetadata,
    resetObserver,
    retryBurst,
} from './sync/sync';

async function init(): Promise<void> {
    await loadState();

    // Sync from other tabs
    onStorageChange(() => {
        updateButton();
        applyCrop(getPlayer());
    });

    // Apply crop immediately on resize and fullscreen
    window.addEventListener('resize', applyCropNow, { passive: true });
    document.addEventListener('fullscreenchange', applyCropAndSync);
    document.addEventListener('yt-navigate-finish', retryBurst);
    document.addEventListener('yt-navigate-start', resetObserver);
    document.addEventListener('loadedmetadata', onVideoMetadata, true);

    retryBurst();
}

init();