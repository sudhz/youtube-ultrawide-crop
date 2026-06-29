# YouTube Ultrawide Crop

Turn it on once. Every YouTube video stays cropped until you turn it off.

YouTube Ultrawide Crop is a small browser extension for desktop YouTube. It adds
one button inside YouTube's native video player controls. Clicking the button
zooms the video to fill the player, which is useful on ultrawide displays where
videos often show black bars.

This project is not affiliated with YouTube, Google, or Alphabet.

## Features

- YouTube player button for ultrawide crop / zoom-to-fill
- Global persistent on/off state across videos, refreshes, and navigation
- Works with YouTube's single-page navigation
- Works in fullscreen
- No popup
- No background service worker
- No analytics
- No remote code
- No accounts or login
- No data collection
- Minimal permission set: `storage` only

## Install Locally

You need [Bun](https://bun.sh) and Chrome or another Chromium browser.

```bash
bun install
bun run build
```

Then load it in Chrome:

1. Go to `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Open or refresh YouTube

## Development

```bash
bun install
bun run dev
```

The dev command rebuilds the JavaScript on save. Reload the YouTube tab to test
changes.

Useful commands:

```bash
bun run typecheck
bun run build
bun run pack
bun run release:chrome
```

`bun run release:chrome` validates the project, rebuilds `dist/`, and writes a
Chrome Web Store ready ZIP to `artifacts/`.

## Project Structure

```text
src/
  index.ts             content-script entrypoint
  content.css          YouTube button and crop styling
  manifest.json        Manifest V3 extension manifest
  player/              button, crop, and DOM helpers
  storage/             persisted state
  sync/                YouTube navigation and DOM sync
scripts/
  build.ts             build dist/
  package.ts           zip dist/ for release
icons/                 extension icons
store-assets/          Chrome Web Store listing graphics
```

## How It Works

The extension stores one boolean, `cropEnabled`, in `chrome.storage.local`.

When crop is enabled, the content script adds a class to YouTube's
`#movie_player` element and sets a CSS scale variable based on the current
player aspect ratio and video aspect ratio. The CSS clips the player and scales
the rendered video from the center.

YouTube rebuilds parts of its player during normal navigation, so the extension
uses YouTube navigation events, a controls-scoped `MutationObserver`, video
metadata events, resize, fullscreen, and short retry bursts to keep the button
and crop state in sync.

## Permissions

| Permission | Why |
| --- | --- |
| `storage` | Stores whether ultrawide crop is on or off |

The content script is limited to:

```text
https://www.youtube.com/*
```

There is no `activeTab`, `tabs`, `scripting`, `webRequest`,
`web_accessible_resources`, background service worker, or popup.

## Privacy

See [PRIVACY.md](PRIVACY.md).

Short version: this extension stores only the on/off toggle locally in the
browser. It does not collect, transmit, sell, or share any user data.

## License

MIT. See [LICENSE](LICENSE).
