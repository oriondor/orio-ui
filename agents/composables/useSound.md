---
kind: composable
category: Composables
purpose: audio cue playback, sound effect, UI click sound, beep
short: low-latency Web Audio playback with a shared module-level AudioContext and per-URL buffer cache
invariants: true
---

# useSound — agent-only invariants

`useSound` returns `{ play, prefetch }`. It uses the Web Audio API (not
`<audio>` elements) for low-latency, gapless playback. State is
module-level — every consumer shares the same `AudioContext` and buffer
cache.

## Invariants

- **Module-level singleton `AudioContext`**, created lazily on first
  call. Same instance is reused across every `useSound()` consumer in
  the page.
- **Module-level `bufferCache`** keyed by source URL. Multiple
  consumers with the same `src` share decoded buffers.
- **Default sound is a remote URL** —
  `https://cdn.jsdelivr.net/gh/oriondor/orio-ui@main/docs/public/sounds/mechanical-switch.wav`.
  No offline / bundled fallback. Calling `play()` without a custom
  `src` requires network on first use (cached thereafter by the
  browser).
- **Default `volume` is `0.3`** (Web Audio Gain node). Range `0..1`;
  values above clip ungracefully.
- **`prefetch: true`** in options eagerly fetches + decodes the buffer
  at construction. Without it, the first `play()` includes
  fetch + decode latency.
- **`play()` auto-resumes a suspended context.** Browsers gate audio on
  a user gesture; the first call after a click/key event will resume
  the context.
- **Returned `prefetch` warms the cache** for the configured `src` —
  same as constructor `prefetch: true`, callable on demand.

## Gotchas

- **Cross-origin / CDN dependency**: the default sound relies on
  `cdn.jsdelivr.net`. For self-hosted apps, pass your own `src`.
- **No volume reactivity**: changing `volume` after construction does
  nothing. Recreate `useSound({ volume: 0.5 })` to change the level.
- **Errors are swallowed** with `console.error`. There is no `loaded`
  ref, no `error` ref, no promise resolution to await. `play()` returns
  a resolved promise even if the buffer never loaded.
- **No autoplay before user gesture.** Calling `play()` before any user
  interaction will silently fail in most browsers — the resume call
  succeeds but the buffer source won't produce audio. Wire to a click
  or keydown.
- **`AudioContext` is never closed.** Long-lived apps accumulate one
  context; for very long sessions, this is usually fine because the
  context is shared.

## Quick reference

```ts
import { useSound } from "../composables/useSound";

const { play, prefetch } = useSound({
  src: "/sounds/click.wav",
  volume: 0.4,
  prefetch: true, // load + decode now, before first user interaction
});

// Later, on click:
button.addEventListener("click", () => play());
```

## Related

- `<orio-animated-container>` — exposes `play` via the slot prop bag.
- Public API reference: `docs/composables/use-sound.md`.
