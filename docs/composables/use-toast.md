# useToast

Queue-backed notifications. One shared queue serves the whole app, and the
module mounts the [`Toast`](/components/toast) host that draws it — you never
place a container.

## Live Demo

<script setup>
import { getCurrentInstance, onMounted } from 'vue'
import { useToast } from '../../src/runtime/composables/useToast'
import { mountToastHost } from '../../src/runtime/components/Toast/mount'

const { showToast, clearToasts, toasts } = useToast()

// These docs are not a Nuxt app, so the host is mounted by hand here.
const instance = getCurrentInstance()
onMounted(() => mountToastHost(instance.appContext))

function showSaved() {
  showToast({ message: 'Changes saved', variant: 'success' })
}

function showSticky() {
  showToast({
    title: 'Connection lost',
    message: 'Retrying in the background.',
    variant: 'danger',
    timeout: 0,
  })
}

function showCountdown() {
  showToast({
    message: 'Watch the bar run out. Hover to hold it.',
    variant: 'success',
    timeout: 8000,
    showTimeout: true,
  })
}

function showUndoable() {
  showToast({
    message: 'report-q3.pdf moved to trash.',
    variant: 'alert',
    timeout: 0,
    actions: [
      { label: 'Undo', onClick: () => showToast({ message: 'Restored', variant: 'success' }) },
    ],
  })
}
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-button @click="showSaved()">Auto-dismiss</orio-button>
    <orio-button variant="secondary" @click="showSticky()">Sticky</orio-button>
    <orio-button variant="secondary" @click="showUndoable()">With undo</orio-button>
    <orio-button variant="secondary" @click="showCountdown()">With countdown</orio-button>
    <orio-button variant="subdued" @click="clearToasts()">Clear all</orio-button>
  </div>
  <orio-view-text>In the queue: {{ toasts.length }}</orio-view-text>
</div>

## API

```typescript
const {
  toasts,
  showToast,
  closeToast,
  clearToasts,
  pauseToast,
  resumeToast,
  triggerAction,
  setToastDefaults,
} = useToast();
```

| Member             | Signature                                       | Description                                        |
| ------------------ | ----------------------------------------------- | -------------------------------------------------- |
| `toasts`           | `Ref<ToastItem[]>`                               | The live queue, oldest first                        |
| `showToast`        | `(options: ToastOptions) => string`              | Queues a toast, returns its id                      |
| `closeToast`       | `(id: string) => void`                           | Removes one toast                                   |
| `clearToasts`      | `() => void`                                     | Empties the queue                                   |
| `pauseToast`       | `(id: string) => void`                           | Holds a countdown where it stands                   |
| `resumeToast`      | `(id: string) => void`                           | Runs the remaining time                             |
| `triggerAction`    | `(toast, action) => Promise<void>`               | Runs an action and applies its close behavior       |
| `setToastDefaults` | `(overrides: Partial<ToastDefaults>) => void`    | Changes defaults for toasts shown afterwards        |

### ToastOptions

| Option     | Type                                          | Default       | Description                                  |
| ---------- | --------------------------------------------- | ------------- | -------------------------------------------- |
| `message`  | `string`                                      | required      | Body text                                    |
| `title`    | `string`                                      | —             | Bold line above the message                  |
| `variant`  | `"info" \| "success" \| "alert" \| "danger"`  | `"info"`      | Color family and urgency                     |
| `position` | `ToastPosition`                               | `"bottom-end"` | Which stack it joins                        |
| `target`   | `ToastTarget`                                 | viewport      | Scope the toast inside an element            |
| `timeout`  | `number`                                      | `5000`        | Milliseconds before auto-dismiss; `0` sticks |
| `closable` | `boolean`                                     | `true`        | Renders the close button                     |
| `showTimeout` | `boolean`                                  | `false`       | Draws a depleting bar for the remaining time |
| `actions`  | `ToastAction[]`                               | `[]`          | Buttons rendered on the trailing side        |

`ToastPosition` is one of `top-start`, `top-center`, `top-end`,
`bottom-start`, `bottom-center`, `bottom-end`.

`ToastTarget` is `string | HTMLElement | Ref<HTMLElement | null | undefined>`,
so an unresolved template ref is a valid target.

### ToastAction

| Field      | Type                                          | Description                                    |
| ---------- | --------------------------------------------- | ---------------------------------------------- |
| `label`    | `string`                                      | Button text                                    |
| `variant`  | `"primary" \| "secondary" \| "subdued"`       | Button variant, defaults to `"secondary"`      |
| `icon`     | `string`                                      | Icon name passed to the button                 |
| `keepOpen` | `boolean`                                     | Leave the toast up after the handler resolves  |
| `onClick`  | `({ close, toast }) => void \| Promise<void>` | Handler; `close()` dismisses early             |

## Basic Usage

```vue
<script setup>
const { showToast } = useToast();

function save() {
  showToast({ message: "Changes saved", variant: "success" });
}
</script>
```

## Actions

A handler runs first, then the toast closes itself. An async handler keeps the
toast on screen until it resolves, so a slow undo stays visible while it works.

```vue
<script setup>
const { showToast } = useToast();

function deleteFile(file) {
  showToast({
    message: "File deleted",
    timeout: 0,
    actions: [
      // closes once restore() resolves
      { label: "Undo", onClick: () => restore(file) },

      // stays open
      { label: "Details", keepOpen: true, onClick: ({ close }) => openModal() },
    ],
  });
}
</script>
```

Queue toasts from event handlers or `onMounted` — never from the setup body,
which also runs on the server.

## Scoping to an element

```vue
<script setup>
const panel = ref(null);
const { showToast } = useToast();

function notifyInPanel() {
  showToast({
    message: "Saved to this panel",
    target: panel,
    position: "top-end",
  });
}
</script>

<template>
  <section ref="panel">
    <orio-button @click="notifyInPanel">Notify</orio-button>
  </section>
</template>
```

A `static` target is switched to `position: relative` so its toasts anchor to
it. Selectors (`"#sidebar"`) are resolved to their element, so they behave
exactly like passing that element; a selector that matches nothing falls back
to the viewport corner.

## Defaults

```typescript
setToastDefaults({
  variant: "info",
  position: "bottom-end",
  timeout: 5000,
  closable: true,
  showTimeout: false,
  limit: 5,
});
```

The bar freezes whenever its stack is hovered or focused, since the countdown
it draws is frozen too. Sticky toasts (`timeout: 0`) never draw one.

`limit` counts per stack — one position on one target — so a busy corner drops
its oldest toast while other corners are untouched.
