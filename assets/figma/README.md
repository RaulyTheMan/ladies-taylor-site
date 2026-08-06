# Ladies Taylor 2.0 — Figma asset pull

Source: https://www.figma.com/design/v5VcNhJPJF5xUBc6Eoefqr/Ladies-Taylor-2.0
Pulled: 2026-07-27

## What's here

- `logo/` — cropped exports of the wordmark/badge (see note below on fidelity)
- `illustrations/` — the 6 recurring mascot/background illustrations, deduped (each appeared 2x across frame variants), highest resolution kept
- `mockups/` — the mini app/store-cart preview image used inside the homepage's "window" banner
- `reference/` — full-page and per-frame screenshots of every explored layout, for visual/spacing reference while building
- `tokens.md` — colors sampled directly from the rendered pixels (accurate hex, not eyeballed)

## Fidelity note — read before building

Figma's metadata tool is hitting a parser bug on this file (an emoji in the homepage bio text breaks its JSON response), which blocked pulling exact layer names, node IDs, and true vector/SVG exports. What you have instead:

- **Illustrations & mockup image**: pulled via Figma's raw-image export — these are the actual source files, full fidelity, no loss.
- **Logo files** (`logo/*.png`): raster crops from a native-resolution (12833px-wide) full-page screenshot, not true vector exports. They're clean enough for layout/dev reference but will look soft if scaled up large (e.g. a big hero lockup). **Recommend**: in Figma desktop, select the logo layer(s) directly and use Export → SVG for the final production asset — should take 30 seconds and gets you pixel-perfect vector.
- **Fonts**: not extracted programmatically. Visually there are two families in play — a blackletter/gothic display face for punchy headlines ("Fuck The Bullshit", "ladies.taylor", "Leonardo da Vinci") and a bold condensed sans for nav/UI/body. Confirm exact family names in Figma's Inspect panel before sourcing web fonts.
- No standalone icon SVGs were found (nav chevrons, form icons etc. didn't surface as exportable vectors) — these are small enough to just rebuild directly in code.

## Frame variants captured

Homepage has 3 unstarted color directions (yellow / pink / blue) plus one more-finished Instagram-profile-style layout — none marked as final. Confirm which is the build target before front-ending the homepage.
