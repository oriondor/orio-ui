---
kind: component
category: Layout & containers
purpose: animation wrapper, fade/slide a slot, animated list, mount-stagger layout
short: flex container that fade-slides its direct children up on mount and exposes a sound `play` callback
invariants: true
---

# AnimatedContainer — agent-only invariants

`<orio-animated-container>` is a flex layout that runs a fade-in-up CSS
animation on every direct child when it mounts. It is **not** a Vue
`<Transition>` — there is no leave animation and reactive state changes do
not retrigger it.

## Invariants

- **Animation fires on mount only.** The `containerFadeInUp` keyframe is a
  plain CSS animation on `.animated-container > *`. To replay, change
  `:key` on the container (or on the child). Re-rendering reactive content
  inside the slot does **not** restart the animation.
- **Only direct children animate.** The selector is `> *`. Wrapping children
  in an extra `<div>` moves the animation up to the wrapper. Nested deep
  trees do not animate per-node.
- **Layout is opinionated.** The container is `display: flex; flex-wrap:
  wrap; justify-content: center; gap: 1rem; padding-inline: 1rem;`. Treat it
  as a layout primitive, not a transparent wrapper.
- **`direction` toggles flex-direction _and_ justification.** `"row"`
  (default) → wrap + centered. `"column"` → `flex-direction: column` +
  `justify-content: flex-start`.
- **`play` slot prop is `useSound().play`.** The default slot exposes
  `{ play }`. Wire it to `@mouseenter` / `@click` on children for hover or
  tap feedback. There is no prop to disable or swap the sound — it is
  global `useSound`.

## Gotchas

- **No leave animation.** Items removed from the slot disappear instantly.
  If you need exit animation, wrap each item in `<Transition>` or use a
  different primitive.
- **Newly inserted children animate independently.** When the slot's child
  list grows (v-for over a reactive array), each new node animates on its
  own mount — there is no list-coordinated stagger.
- **Built-in horizontal padding bleeds.** `padding-inline: 1rem` is on the
  container. If the consumer wraps it in a tight column, the inner content
  starts 1rem in. Override with `:deep(.animated-container)` or pad the
  parent.
- **`direction="column"` does not stretch children.** They still wrap by
  default (`flex-wrap: wrap` is unchanged). Children narrower than the
  container will not fill the row.

## Quick reference

```vue
<script setup lang="ts">
import { ref } from "vue";

const animationKey = ref(0);
function replay() {
  animationKey.value += 1;
}
</script>

<template>
  <orio-button @click="replay">Replay</orio-button>

  <orio-animated-container :key="animationKey" direction="column" v-slot="{ play }">
    <div v-for="item in items" :key="item.id" @mouseenter="play">
      {{ item.label }}
    </div>
  </orio-animated-container>
</template>
```

## Related

- `useSound` composable — the source of the `play` callback. See
  `docs/composables/use-sound.md`.
- Public API reference: `docs/components/animated-container.md`.
