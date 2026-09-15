# Toast

Floating notification with variants, actions and auto-dismiss. Toasts are
created from script through [`useToast`](/composables/use-toast), so there is
no markup to place — the module mounts the toast host for you.

## Live Demo

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
import { useToast } from '../../src/runtime/composables/useToast'
import { mountToastHost } from '../../src/runtime/components/Toast/mount'

const { showToast, clearToasts } = useToast()

// These docs are not a Nuxt app, so the host is mounted by hand here.
// In a Nuxt project the module's plugin does this for you.
const instance = getCurrentInstance()
onMounted(() => mountToastHost(instance.appContext))

const variants = ['info', 'success', 'alert', 'danger']
const positions = [
  'top-start', 'top-center', 'top-end',
  'bottom-start', 'bottom-center', 'bottom-end',
]

const panel = ref(null)
const dismissed = ref(false)

function showVariant(variant) {
  showToast({
    title: variant === 'danger' ? 'Upload failed' : undefined,
    message: `This is a ${variant} toast.`,
    variant,
  })
}

function showAtPosition(position) {
  showToast({ message: `Anchored ${position}`, position })
}

function showWithActions() {
  showToast({
    title: 'File deleted',
    message: 'report-q3.pdf moved to trash.',
    variant: 'alert',
    timeout: 0,
    actions: [
      { label: 'Undo', onClick: () => showToast({ message: 'Restored', variant: 'success' }) },
      { label: 'Details', variant: 'subdued', keepOpen: true, onClick: () => {} },
    ],
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

function showInPanel() {
  showToast({ message: 'Scoped to the panel', target: panel, position: 'top-end' })
}
</script>

### Variants

<div class="demo-container">
  <div class="demo-row">
    <orio-button v-for="variant in variants" :key="variant" :variant="variant === 'danger' ? 'secondary' : 'primary'" @click="showVariant(variant)">
      {{ variant }}
    </orio-button>
  </div>
</div>

### Positions

<div class="demo-container">
  <div class="demo-row" style="flex-wrap: wrap">
    <orio-button v-for="position in positions" :key="position" variant="secondary" @click="showAtPosition(position)">
      {{ position }}
    </orio-button>
  </div>
</div>

### Actions

Handlers run, then the toast closes itself. Pass `keepOpen` to leave it up, or
call `close()` from the handler to dismiss it early. Hovering a stack pauses
every countdown in it.

<div class="demo-container">
  <div class="demo-row">
    <orio-button @click="showWithActions()">Delete a file</orio-button>
    <orio-button variant="subdued" @click="clearToasts()">Clear all</orio-button>
  </div>
</div>

### Shown timeout

`showTimeout` draws a depleting bar along the bottom edge for exactly the
toast's `timeout`. Hovering or focusing the stack freezes the bar together with
the countdown it represents. A sticky toast (`timeout: 0`) never grows one —
there is nothing to count down.

<div class="demo-container">
  <div class="demo-row">
    <orio-button @click="showCountdown()">Show with countdown</orio-button>
  </div>
</div>

### Scoped to an element

Pass `target` to keep a toast inside one region instead of the viewport corner.

<div class="demo-container">
  <div ref="panel" style="min-height: 9rem; padding: 1rem; border: 1px dashed var(--color-border); border-radius: var(--border-radius-md)">
    <orio-view-text>This panel owns its own toast stack.</orio-view-text>
    <br>
    <orio-button variant="secondary" @click="showInPanel()">Notify in panel</orio-button>
  </div>
</div>

## Usage

### Basic

```vue
<script setup>
const { showToast } = useToast();

function save() {
  showToast({ message: "Changes saved", variant: "success" });
}
</script>
```

### With actions

```vue
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

### Standalone component

`<orio-toast>` also works on its own — inside a page, a list, or a custom
container — when you want a static notice rather than a queued one. It emits
rather than acts, so nothing dismisses it but you. The `actions` slot is the
straightforward way to wire buttons here; the `actions` prop expects handlers
shaped for the queue.

<div class="demo-container">
  <orio-toast
    v-if="!dismissed"
    title="Storage almost full"
    message="You have used 92% of your plan."
    variant="alert"
    @close="dismissed = true"
  >
    <template #actions>
      <orio-button @click="showToast({ message: 'Opening billing', variant: 'info' })">
        Upgrade
      </orio-button>
    </template>
  </orio-toast>
  <orio-button v-else variant="subdued" @click="dismissed = false">Bring it back</orio-button>
</div>

```vue
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

## Props

| Prop          | Type                                         | Default  | Description                                      |
| ------------- | -------------------------------------------- | -------- | ------------------------------------------------ |
| `message`     | `string`                                     | `""`     | Body text; ignored when the default slot is used |
| `title`       | `string`                                     | —        | Bold line above the message                      |
| `variant`     | `"info" \| "success" \| "alert" \| "danger"` | `"info"` | Color family and screen-reader urgency           |
| `closable`    | `boolean`                                    | `true`   | Renders the close button                         |
| `timeout`     | `number`                                     | `0`      | Duration the countdown bar runs for, in ms       |
| `showTimeout` | `boolean`                                    | `false`  | Draws the countdown bar; needs `timeout > 0`     |
| `paused`      | `boolean`                                    | `false`  | Freezes the countdown bar                        |
| `actions`     | `ToastAction[]`                              | `[]`     | Buttons rendered on the trailing side            |

## Events

| Event    | Payload       | Description                       |
| -------- | ------------- | --------------------------------- |
| `close`  | —             | Close button clicked              |
| `action` | `ToastAction` | One of the action buttons clicked |

## Slots

| Slot      | Props                | Description                          |
| --------- | -------------------- | ------------------------------------ |
| `default` | —                    | Replaces the message text            |
| `actions` | `{ actions, close }` | Replaces the rendered action buttons |

## Accessibility

- `danger` toasts render `role="alert"`, every other variant `role="status"`.
- The close button is labelled through i18n (`toast.close`).
- Hovering or focusing a stack pauses its countdowns, so keyboard users are
  not raced by the timeout.
