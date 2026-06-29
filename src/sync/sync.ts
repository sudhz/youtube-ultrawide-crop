/**
 * Sync — debounced re-injection and re-apply of button + crop.
 * Watches for YouTube DOM changes and navigation events.
 */

import { applyCrop } from '../player/crop';
import { injectButton } from '../player/button';
import { getPlayer, getControls } from '../player/dom';

let syncTimer = 0;
let controlsObserver: MutationObserver | null = null;
let observedControls: HTMLElement | null = null;
let retryTimerA = 0;
let retryTimerB = 0;

function observeControls(controls: HTMLElement | null): void {
    if (observedControls === controls) {
        return;
    }

    controlsObserver?.disconnect();
    controlsObserver = null;
    observedControls = controls;

    if (!controls) {
        return;
    }

    controlsObserver = new MutationObserver(scheduleSync);
    controlsObserver.observe(controls, {
        childList: true,
    });
}

function sync(): void {
    const player = getPlayer();
    const controls = player && getControls(player);
    observeControls(controls);
    if (player && controls) {
        injectButton(player, controls);
    }
    applyCrop(player);
}

export function scheduleSync(): void {
    if (syncTimer) {
        return;
    }
    syncTimer = window.setTimeout(() => {
        syncTimer = 0;
        sync();
    }, 200);
}

// Retry burst for YouTube's staggered DOM rebuilds after navigation
export function retryBurst(): void {
    if (retryTimerA) {
        window.clearTimeout(retryTimerA);
        retryTimerA = 0;
    }
    if (retryTimerB) {
        window.clearTimeout(retryTimerB);
        retryTimerB = 0;
    }

    scheduleSync();
    retryTimerA = window.setTimeout(() => {
        retryTimerA = 0;
        scheduleSync();
    }, 300);
    retryTimerB = window.setTimeout(() => {
        retryTimerB = 0;
        scheduleSync();
    }, 800);
}

export function resetObserver(): void {
    observeControls(null);
}

export function onVideoMetadata(event: Event): void {
    const player = getPlayer();
    if (
        player &&
        event.target instanceof HTMLVideoElement &&
        player.contains(event.target)
    ) {
        scheduleSync();
    }
}

export function applyCropNow(): void {
    applyCrop(getPlayer());
}

export function applyCropAndSync(): void {
    applyCrop(getPlayer());
    scheduleSync();
}