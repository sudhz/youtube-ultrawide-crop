/**
 * DOM helpers — find YouTube's player and controls elements.
 */

export function getPlayer(): HTMLElement | null {
    return document.querySelector<HTMLElement>('#movie_player');
}

export function getControls(player: HTMLElement): HTMLElement | null {
    return player.querySelector<HTMLElement>('.ytp-right-controls');
}