---
kind: component
category: Media & misc
purpose: carousel preview, thumbnails strip, image picker strip, gallery thumbnails
short: horizontal thumbnail strip for the Carousel; clicking a thumb updates the shared `activeImage` model
invariants: true
---

# gallery/CarouselPreview — agent-only invariants

`<orio-gallery-carousel-preview>` renders a horizontal scrollable strip of
thumbnails for `<orio-gallery-carousel>`. Bind both components to the same
`v-model:active-image` and they stay in sync.

## Invariants

- **v-model name is `activeImage`** (same as the Carousel) and the type
  is `string`. Share the same ref between them.
- **Hidden when `images.length ≤ 1`.** Single-image galleries don't
  render a strip.
- **Each thumbnail is a `<button>`** with `aria-pressed` (true when
  active) and `aria-label` `"Show image N of M"` for screen readers.
- **Thumbnails are 3.5rem × 3.5rem** with `object-fit` driven by `fit`
  (default `"cover"`, unlike Carousel's `"contain"` default).
- **`#image` slot** overrides the default `<img>` render. Receives
  `{ image }`. Same signature as the Carousel slot.
- **Strip scrolls horizontally** with `overflow-x: auto`. No
  auto-scroll-to-active — clicking a thumb that's offscreen won't
  scroll it into view.
- **Active thumb gets**: opacity 1, accent border. Inactive: opacity
  0.6 with a hover bump to 0.85.

## Gotchas

- **No keyboard arrow nav between thumbs.** Tab moves between buttons;
  Enter / Space activates. Add roving-focus if needed.
- **No auto-scroll on active change.** If the consumer changes
  `activeImage` from elsewhere, the strip doesn't follow — scroll it
  into view yourself via `element.scrollIntoView()`.
- **Alt is `""`** on thumbnails by default — they're treated as
  decorative because the `<button>` carries the accessible name.

## Quick reference

See `<orio-gallery-carousel>` USAGE.md.

## Related

- `<orio-gallery-carousel>` — the main viewer; share the
  `activeImage` model.
- Public API reference: `docs/components/gallery/`.
