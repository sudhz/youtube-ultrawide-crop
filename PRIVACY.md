# Privacy Policy

Effective date: 2026-10-04

## Data Stored Locally

The extension stores one setting in local extension storage:

- `cropEnabled`: whether ultrawide crop is currently on or off.

This value stays on your device inside the browser's extension storage. It is used to remember your crop preference across YouTube videos, refreshes, and navigation.

## Feedback

The popup can open a feedback form hosted by Tally (`tally.so`). On uninstall, the browser opens the same form automatically. Form submission is voluntary — no response is submitted without action.

When the form opens, the extension adds only:

- `source`: a label identifying the browser and where the form was opened from (`chrome-popup`, `firefox-popup`, `chrome-uninstall`, or `firefox-uninstall`).
- `version`: the installed extension version.

On Firefox, these two values are added only when the optional technical and
interaction data permission is enabled. Otherwise, the form opens without
either value.

### What the form collects

Apart from those two values, the form only receives what you choose to enter:
your answers, and optionally a YouTube link, a description, and your email
address. Leaving your email is optional. If you do, it is used only to follow
up on your feedback and to tell you when the issue is fixed. It is not used for
marketing, added to a mailing list, or shared with anyone other than Tally,
which hosts the form.

Tally handles form contents and normal request information (such as IP address) under its own [privacy policy](https://tally.so/help/privacy-policy).

## Permissions

The extension uses the `storage` permission to remember the crop toggle. The content script runs only on `https://www.youtube.com/*`.

## Third Parties

This extension is not affiliated with YouTube, Google, or Alphabet. Tally hosts the optional feedback form.

## Contact

For privacy questions, open an issue at https://github.com/sudhz/youtube-ultrawide-crop/issues.
