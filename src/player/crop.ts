/**
 * Crop — applies zoom-to-fill by adding a class + CSS variable to #movie_player.
 * The actual transform is defined in content.css.
 */

import { isEnabled } from '../storage/state';

const CROP_CLASS = 'ytuc-crop-on';
const SCALE_VAR = '--ytuc-scale';

export function applyCrop(player: HTMLElement | null): void {
    if (!player) {
        return;
    }

    if (!isEnabled()) {
        if (player.classList.contains(CROP_CLASS)) {
            player.classList.remove(CROP_CLASS);
        }
        if (player.style.getPropertyValue(SCALE_VAR)) {
            player.style.removeProperty(SCALE_VAR);
        }
        return;
    }

    const video = player.querySelector<HTMLVideoElement>('video.html5-main-video');
    if (!video) {
        return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
        return;
    }

    const rect = player.getBoundingClientRect();
    if (!rect.width || !rect.height) {
        return;
    }

    // Scale to fill: ratio of player and video aspect ratios
    const videoAspect = vw / vh;
    const playerAspect = rect.width / rect.height;
    const scale =
        Math.round(
            Math.max(playerAspect / videoAspect, videoAspect / playerAspect) * 10000,
        ) / 10000;

    const nextScale = String(scale);
    if (player.style.getPropertyValue(SCALE_VAR) !== nextScale) {
        player.style.setProperty(SCALE_VAR, nextScale);
    }
    if (!player.classList.contains(CROP_CLASS)) {
        player.classList.add(CROP_CLASS);
    }
}