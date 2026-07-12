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
- Read-only popup shows current crop status
- Optional feedback form (popup link and uninstall survey)

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
bun run test
bun run build
bun run lint:firefox
bun run pack:all
bun run release
```

`bun run release` validates the project (typecheck, build, tests, Firefox lint)
and creates Chrome, Firefox, and source ZIPs in `artifacts/`.

## Release

Releases are published from `main` via GitHub Releases.

1. Bump `version` in `package.json` (three-part numeric, e.g. `1.2.0`).
2. Commit and push to `main`.
3. Create a GitHub Release tagged `vX.Y.Z` with release notes.
4. The `publish` workflow builds the extension, attaches ZIPs to the release,
   submits Chrome through the Web Store V2 API, and submits Firefox through
   `web-ext sign`.

Chrome publishes automatically after review approval. Firefox receives a listed
update with source code and release notes. Store listing text and graphics are
maintained manually.

## How It Works

The extension stores one boolean, `cropEnabled`, in extension local storage (`chrome.storage.local` on Chrome and `browser.storage.local` on Firefox).

A read-only toolbar popup displays whether crop is currently on or off by
reading the stored value once when opened. The popup cannot toggle crop — only
the player button can. A tiny background script registers an uninstall survey
URL so the browser can open the optional feedback form if you remove the
extension.

When crop is enabled, the content script adds a class to YouTube's
`#movie_player` element and sets a CSS scale variable based on the current
player aspect ratio and video aspect ratio. The CSS clips the player and scales
the rendered video from the center.

YouTube rebuilds parts of its player during normal navigation, so the extension
uses YouTube navigation events, a controls-scoped `MutationObserver`, video
metadata events, resize, fullscreen, and short retry bursts to keep the button
and crop state in sync.

## Permissions

| Permission | Why                                        |
| ---------- | ------------------------------------------ |
| `storage`  | Stores whether ultrawide crop is on or off |

The content script is limited to `https://www.youtube.com/*`.

## Feedback

The popup's **Share feedback** link opens a Tally form. On uninstall, the
browser opens the same form automatically. The extension adds only a `source`
label and its `version` to the form URL. See [PRIVACY.md](PRIVACY.md) for
details about Tally's role. On Firefox, those values are included only when the
optional technical and interaction data permission is enabled.

## Privacy

See [PRIVACY.md](PRIVACY.md).

## License

MIT. See [LICENSE](LICENSE).
