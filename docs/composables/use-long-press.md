# useLongPress

Long-press detection for any element. Powers `<orio-long-press>`; use it
directly when you need the behavior without the wrapper's scale feedback.

## Live Demo

<script setup>
import { ref } from 'vue'
import { useLongPress } from '../../src/runtime/composables/useLongPress'

const target = ref(null)
const log = ref([])

const { isPressing, isHolding } = useLongPress(target, {
  delay: 600,
  onStart: () => log.value.unshift('start'),
  onCancel: () => log.value.unshift('cancel'),
  onTrigger: (event, source) => log.value.unshift(`trigger (${source})`),
})
</script>

<div class="demo-container">
  <div
    ref="target"
    :style="{
      padding: '2rem',
      border: '1px dashed var(--color-border)',
      borderRadius: 'var(--border-radius-md)',
      userSelect: isHolding ? 'none' : 'auto',
      WebkitUserSelect: isHolding ? 'none' : 'auto',
      WebkitTouchCallout: isHolding ? 'none' : 'default',
      background: isPressing ? 'var(--color-surface)' : 'transparent',
    }"
  >
    <orio-view-text>Hold here</orio-view-text>
  </div>
  <orio-view-text>{{ log.slice(0, 5).join(' ← ') }}</orio-view-text>
</div>

## Usage

```ts
const target = ref<HTMLElement | null>(null);

const { isPressing, isHolding } = useLongPress(target, {
  delay: 600,
  onStart: () => log.value.unshift("start"),
  onCancel: () => log.value.unshift("cancel"),
  onTrigger: (event, source) => log.value.unshift(`trigger (${source})`),
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `delay` | `MaybeRefOrGetter<number>` | `500` | Hold time in ms |
| `moveTolerance` | `MaybeRefOrGetter<number>` | `10` | Movement in px that cancels |
| `forceTouch` | `MaybeRefOrGetter<boolean>` | `true` | Safari force click triggers immediately |
| `disabled` | `MaybeRefOrGetter<boolean>` | `false` | Ignore presses; cancels an active one |
| `onStart` | `(event: PointerEvent) => void` | — | Primary pointer went down |
| `onCancel` | `() => void` | — | Press ended without triggering |
| `onTrigger` | `(event, source: "hold" \| "force") => void` | required | Hold reached `delay`, or force click |

## Returns

| Key | Type | Description |
|---|---|---|
| `isPressing` | `Readonly<Ref<boolean>>` | `true` from pointerdown until trigger or cancel |
| `isHolding` | `Readonly<Ref<boolean>>` | `true` from pointerdown until the finger lifts or the press is cancelled — outlives the trigger |

## Notes

- The click after a trigger is swallowed (capture phase on `window`, so it
  also covers a release over an overlay the trigger opened). Keyboard clicks
  pass through; Ctrl+click never starts a press.
- Nested targets: only the innermost handles a press.
- While `isHolding`, `selectstart` and `contextmenu` on the target are
  prevented; on trigger any selection inside the target is cleared. Bind
  `user-select: none` / `-webkit-touch-callout: none` to `isHolding` for iOS.
- Not to be confused with `usePressAndHold`, which repeats a callback while held.
