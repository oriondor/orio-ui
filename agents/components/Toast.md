---
kind: component
category: Layout & containers
purpose: toast, notification, snackbar, flash message, transient alert, undo bar
short: notification card drawn by the auto-mounted toast host; queue it with `useToast`, never place it by hand
invariants: true
---

# Toast — agent-only invariants

`<orio-toast>` is the presentational card. The queue, the stacks and the
timers live in [`useToast`](../composables/useToast.md), and the host that
draws them is mounted by the module's client plugin. **Consumers do not
place a container.** If someone asks where to put `<orio-toast-container>`,
the answer is nowhere — call `showToast()`.

## Invariants

- **Nothing mounts the host in a non-Nuxt app.** The plugin
  `runtime/plugins/toast.client.ts` calls `mountToastHost(appContext)` on
  `app:mounted`. Outside Nuxt (VitePress docs, a bare `createApp`), call
  `mountToastHost(getCurrentInstance().appContext)` yourself, or toasts
  queue up and never render.
- **The host renders one `<Teleport>` per target and one stack per
  position inside it.** Stacks only exist while they hold toasts.
- **`variant`** is `"info"` (default), `"success"`, `"alert"`, `"danger"`
  — the same soft-background + border token families as `<orio-banner>`,
  plus a solid 3px inline-start rail in the full-strength color.
- **`role` is derived, not passed**: `danger` → `role="alert"`, everything
  else → `role="status"`.
- **The component emits, it does not act.** `@close` and `@action` are
  plain emits; the host wires them to `closeToast` / `triggerAction`. A
  standalone `<orio-toast>` gets no auto-dismiss and no action close
  behavior unless you wire it.
- **The `actions` slot replaces the buttons entirely** (slot props
  `{ actions, close }`) and renders even when the `actions` prop is empty.
  The default slot replaces the message text, not the title.
- **The countdown bar is CSS, not a timer.** `showTimeout` + `timeout > 0`
  renders `.toast-progress`, animated for `var(--toast-timeout)` (the
  `timeout` prop, in ms) and frozen with `animation-play-state` when
  `paused` is set. Nothing ticks in JS, so the bar is the *picture* of the
  countdown — the real timer lives in `useToast`. Keep the two props in
  sync or the bar lies.
- **`timeout` on the component defaults to `0`**, meaning "no bar". The
  host passes the toast's real timeout down; a standalone card must pass
  its own.
- **Close-button label comes from i18n** (`toast.close`), so the component
  requires a vue-i18n instance in its app context.

## Gotchas

- **`.toast-stack` sets `pointer-events: none`; the cards set it back to
  `auto`.** A stack spans a whole screen edge, so forgetting this would
  swallow clicks across the page. Anything you add inside a stack needs
  its own `pointer-events: auto`.
- **`target` elements get mutated.** A target computing to `position:
  static` is given `position: relative` so its stack can anchor. Targets
  with `overflow: hidden` clip their toasts — that is the target's CSS,
  not a bug in the host.
- **Actions are keyed by `label`.** Two actions with the same label in one
  toast collide; give them distinct labels.
- **`.toast` sets `overflow: hidden`** so the bar's square ends do not
  poke past the rounded corners. Anything meant to overflow the card
  (a badge, a dropdown) will be clipped.
- **The rail color is one variable.** `--toast-rail` drives both the
  inline-start border and the bar; variant blocks set it, they no longer
  set `border-inline-start-color` directly.
- **`<orio-toast>` is a card, not a layout.** It has `max-width: min(24rem,
  calc(100vw - 2rem))` and no size variants.

## Quick reference

```vue
<!-- from docs/components/toast.md -->
<script setup>
const { showToast } = useToast();

function deleteFile(file) {
  trash(file);

  showToast({
    title: "File deleted",
    message: `${file.name} moved to trash.`,
    variant: "alert",
    timeout: 0,
    actions: [{ label: "Undo", onClick: () => restore(file) }],
  });
}
</script>
```

Standalone card, wired by the consumer — the `actions` slot is the
straightforward path here, since the `actions` prop expects handlers shaped
for the queue:

```vue
<!-- from docs/components/toast.md -->
<template>
  <orio-toast
    v-if="!dismissed"
    title="Storage almost full"
    message="You have used 92% of your plan."
    variant="alert"
    @close="dismissed = true"
  >
    <template #actions>
      <orio-button @click="goToBilling">Upgrade</orio-button>
    </template>
  </orio-toast>
</template>
```
