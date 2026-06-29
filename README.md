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

You need [Bun](https://bun.sh) and Chrome, another Chromium browser, or Firefox.

```bash
bun install
bun run build
```

Then load it in Chrome:

1. Go to `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the `dist-chrome/` folder
5. Open or refresh YouTube

Or load it temporarily in Firefox:

1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `dist-firefox/manifest.json`
4. Open or refresh YouTube

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
bun run pack:firefox
bun run release:chrome
bun run release:firefox
```

`bun run release:chrome` validates the project, rebuilds `dist-chrome/`, and writes a Chrome Web Store ready ZIP to `artifacts/`.

`bun run release:firefox` validates the project, rebuilds `dist-firefox/`, and writes an AMO-ready Firefox ZIP to `artifacts/`.

## Project Structure

```text
src/
  index.ts             content-script entrypoint
  content.css          YouTube button and crop styling
  manifest.json        shared Manifest V3 extension manifest
  platform/            Chrome/Firefox extension API shim
  player/              button, crop, and DOM helpers
  storage/             persisted state
  sync/                YouTube navigation and DOM sync
scripts/
  build.ts             build dist-chrome/ and dist-firefox/
  package-chrome.ts    zip dist-chrome/ for Chrome Web Store
  package-firefox.ts   zip dist-firefox/ for Firefox AMO
icons/                 extension icons
store-assets/          store listing graphics
PRIVACY.md             privacy policy
```

## How It Works

The extension stores one boolean, `cropEnabled`, in extension local storage (`chrome.storage.local` on Chrome and `browser.storage.local` on Firefox).

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
