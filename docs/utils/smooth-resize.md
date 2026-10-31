# Smooth resize

Page-wide height animation. Any element with `data-smooth-resize` animates
its height when its content grows or shrinks — switched tabs, expanded
sections, async content. No composable, no per-component code.
`<orio-modal>` carries the attribute, so content changes inside an open
modal resize smoothly.

## Live Demo

<script setup>
import { ref } from 'vue'

const expanded = ref(false)
</script>

<div class="demo-container">
  <orio-button @click="expanded = !expanded">
    {{ expanded ? 'Show less' : 'Show more' }}
  </orio-button>
  <div data-smooth-resize :style="{ border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)' }">
    <div :style="{ padding: '1rem' }">
      <orio-view-text>First line is always here.</orio-view-text>
      <template v-if="expanded">
        <orio-view-text>Second line.</orio-view-text>
        <orio-view-text>Third line.</orio-view-text>
        <orio-view-text>Fourth line.</orio-view-text>
      </template>
    </div>
  </div>
</div>

## Usage

```vue
<div data-smooth-resize>
  <div>…changing content…</div>
</div>
```

The Nuxt module installs the watcher on the client. Without Nuxt, start it
once:

```ts
import { startSmoothResize } from "orio-ui/runtime";

startSmoothResize();
```

## Notes

- The **first element child** is measured, the attributed element is
  animated. That child must keep its natural height — not sized by the
  container (no `height: 100%`, no flex-shrink).
- Height only. Width changes snap.
- `overflow: hidden` applies only while animating.
- The first size of a new element (mount, `v-if` swap of the child) is not
  animated. A change mid-animation continues from the current height.
- 250 ms, skipped under `prefers-reduced-motion: reduce`.
- One `ResizeObserver` and one `MutationObserver` serve the whole page;
  elements added or removed later are picked up automatically.
