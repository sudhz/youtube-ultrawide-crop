/**
 * Button — injects and manages the crop toggle button in YouTube's player.
 */

import { isEnabled, toggleCrop } from '../storage/state';
import { applyCrop } from './crop';
import { getPlayer } from './dom';

const BUTTON_ATTR = 'data-ytuc-btn';

const ICON = `
  <svg viewBox="0 0 36 36" width="24" height="24">
    <g fill="none" stroke="currentColor" stroke-width="2.5"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 13V8h5"/><path d="M23 8h5v5"/>
      <path d="M28 23v5h-5"/><path d="M13 28H8v-5"/>
    </g>
    <rect class="ytuc-on" x="13" y="13" width="10" height="10" rx="1"
          fill="currentColor" stroke="none"/>
  </svg>`;

function onButtonClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    toggleCrop();
    updateButton();
    applyCrop(getPlayer());
}

export function injectButton(
    player: HTMLElement,
    controls: HTMLElement,
): void {
    if (player.querySelector(`[${BUTTON_ATTR}]`)) {
        return;
    }

    const button = document.createElement('button');
    button.setAttribute(BUTTON_ATTR, '');
    button.className = 'ytp-button ytuc-btn';
    button.title = 'Ultrawide crop';
    button.setAttribute('aria-label', 'Ultrawide crop');
    button.setAttribute('aria-pressed', String(isEnabled()));
    button.innerHTML = ICON;

    button.addEventListener('click', onButtonClick);

    controls.insertBefore(
        button,
        controls.children.item(controls.children.length - 2),
    );
}

export function updateButton(): void {
    const btn = document.querySelector<HTMLElement>(
        `#movie_player [${BUTTON_ATTR}]`,
    );
    if (!btn) {
        return;
    }
    const pressed = String(isEnabled());
    if (btn.getAttribute('aria-pressed') !== pressed) {
        btn.setAttribute('aria-pressed', pressed);
    }
}