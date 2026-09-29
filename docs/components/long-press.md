# LongPress

Wraps any element and emits `trigger` after a press-and-hold — the web take on
Haptic Touch. The wrapped element slowly scales down while held so the user
sees something is happening. On macOS Safari with a Force Touch trackpad, a
firm click triggers immediately.

## Live Demo

<script setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
import { useModal } from '../../src/runtime/composables/useModal'
import { useToast } from '../../src/runtime/composables/useToast'
import { mountToastHost } from '../../src/runtime/components/Toast/mount'

const { modalProps, openModal } = useModal()
const { showToast } = useToast()

// These docs are not a Nuxt app, so the toast host is mounted by hand here.
const instance = getCurrentInstance()
onMounted(() => mountToastHost(instance.appContext))

const fileActions = [
  { label: 'Rename', icon: 'edit' },
  { label: 'Duplicate', icon: 'copy' },
  { label: 'Share', icon: 'share' },
  { label: 'Delete', icon: 'delete' },
]

function runFileAction(action, close) {
  showToast({ message: `${action.label}: report.pdf`, variant: 'info' })
  close()
}

function copyLink(event, source) {
  showToast({ message: `Link copied (${source})`, variant: 'success' })
}

function deleteProject() {
  showToast({
    message: 'Project deleted',
    variant: 'danger',
    actions: [{ label: 'Undo', onClick: () => showToast({ message: 'Restored' }) }],
  })
}

function hintHoldLonger() {
  showToast({ message: 'Keep holding to delete', variant: 'alert' })
}

const isKeyRevealed = ref(false)

const pikachu = {
  name: 'Pikachu',
  handle: '@pikachu · Lv. 25',
  bio: 'Electric-type. Stores charge in its cheeks; releases it when startled.',
  location: 'Viridian Forest',
  badges: ['Electric', 'Starter', 'Mascot'],
  avatar:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
}

function openProfile() {
  alert('You will be redirected to profile')
}
</script>

### Open a modal on hold

<div class="demo-container">
  <div class="demo-row">
    <orio-long-press @trigger="openModal">
      <orio-button>Hold me</orio-button>
    </orio-long-press>
  </div>

  <orio-modal v-bind="modalProps">
    <orio-view-text type="title">Hidden feature</orio-view-text>
    <orio-view-text>Opened by a long press.</orio-view-text>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</div>

### Context menu in a popover

A click opens the file; a long press opens its actions. Put the long press
inside the popover's default slot and call `toggle(true)` on trigger.

<div class="demo-container">
  <div class="demo-row">
    <orio-popover position="bottom">
      <template #default="{ toggle }">
        <orio-long-press @trigger="toggle(true)">
          <orio-button
            variant="secondary"
            icon="file"
            @click="showToast({ message: 'Opened report.pdf' })"
          >
            report.pdf
          </orio-button>
        </orio-long-press>
      </template>
      <template #content="{ toggle }">
        <div
          style="
            display: flex;
            flex-direction: column;
            padding: 0.25rem;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
          "
        >
          <orio-button
            v-for="action in fileActions"
            :key="action.label"
            variant="subdued"
            :icon="action.icon"
            @click="runFileAction(action, () => toggle(false))"
          >
            {{ action.label }}
          </orio-button>
        </div>
      </template>
    </orio-popover>
  </div>
</div>

### User card with a peek preview

Click the card to open the profile; long press it to peek underneath first.

<div class="demo-container">
  <div class="demo-row">
    <orio-popover position="bottom">
      <template #default="{ toggle }">
        <orio-long-press @trigger="toggle(true)">
          <button
            type="button"
            style="
              display: flex;
              align-items: center;
              gap: 0.75rem;
              padding: 0.5rem 1rem 0.5rem 0.5rem;
              background: var(--color-surface);
              border: 1px solid var(--color-border);
              border-radius: var(--border-radius-pill);
              color: var(--color-text);
              font: inherit;
              cursor: pointer;
            "
            @click="openProfile"
          >
            <img
              :src="pikachu.avatar"
              :alt="pikachu.name"
              draggable="false"
              style="
                width: 48px;
                height: 48px;
                border-radius: 50%;
                object-fit: cover;
                background: var(--color-bg);
                border: 2px solid var(--color-accent);
              "
            />
            <orio-view-text type="subtitle">{{ pikachu.name }}</orio-view-text>
          </button>
        </orio-long-press>
      </template>
      <template #content>
        <div
          style="
            min-width: 240px;
            padding: 1rem;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
          "
        >
          <orio-view-text type="title">{{ pikachu.name }}</orio-view-text>
          <orio-view-text type="italics">{{ pikachu.handle }}</orio-view-text>
          <orio-view-text>{{ pikachu.bio }}</orio-view-text>
          <orio-view-text icon="map-pin">{{ pikachu.location }}</orio-view-text>
          <div class="demo-row" style="margin-top: 0.5rem; gap: 0.5rem;">
            <orio-tag
              v-for="badge in pikachu.badges"
              :key="badge"
              :text="badge"
              variant="accent"
            />
          </div>
        </div>
      </template>
    </orio-popover>
  </div>
</div>

### Quick action with a toast

`source` tells a hold from a Safari force click.

<div class="demo-container">
  <div class="demo-row">
    <orio-long-press @trigger="copyLink">
      <orio-button variant="secondary" icon="link">Hold to copy link</orio-button>
    </orio-long-press>
  </div>
</div>

### Hold to confirm

A longer `delay` and deeper `scale` for destructive actions. `press-cancel`
explains what went wrong when the user lets go too early.

<div class="demo-container">
  <div class="demo-row">
    <orio-long-press
      :delay="1500"
      :scale="0.85"
      @trigger="deleteProject"
      @press-cancel="hintHoldLonger"
    >
      <orio-button icon="delete">Hold to delete project</orio-button>
    </orio-long-press>
  </div>
</div>

### Reveal a hidden value

<div class="demo-container">
  <div class="demo-row">
    <orio-view-text>API key</orio-view-text>
    <orio-long-press @trigger="isKeyRevealed = !isKeyRevealed">
      <orio-button variant="subdued" :icon="isKeyRevealed ? 'eye-off' : 'eye'">
        {{ isKeyRevealed ? 'My password' : '••••••••••••••••' }}
      </orio-button>
    </orio-long-press>
  </div>
</div>

## Usage

```vue
<template>
  <orio-long-press @trigger="openModal">
    <orio-button>Hold me</orio-button>
  </orio-long-press>

  <orio-modal v-bind="modalProps">
    <orio-view-text type="title">Hidden feature</orio-view-text>
    <orio-view-text>Opened by a long press.</orio-view-text>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Context menu in a popover

```vue
<template>
  <orio-popover position="bottom">
    <template #default="{ toggle }">
      <orio-long-press @trigger="toggle(true)">
        <orio-button variant="secondary" icon="file" @click="openFile">
          report.pdf
        </orio-button>
      </orio-long-press>
    </template>
    <template #content="{ toggle }">
      <div class="menu-panel">
        <orio-button
          v-for="action in fileActions"
          :key="action.label"
          variant="subdued"
          :icon="action.icon"
          @click="runFileAction(action, () => toggle(false))"
        >
          {{ action.label }}
        </orio-button>
      </div>
    </template>
  </orio-popover>
</template>
```

### User card with a peek preview

```vue
<template>
  <orio-popover position="bottom">
    <template #default="{ toggle }">
      <orio-long-press @trigger="toggle(true)">
        <button type="button" class="user-card" @click="openProfile">
          <img :src="user.avatar" :alt="user.name" draggable="false" />
          <orio-view-text type="subtitle">{{ user.name }}</orio-view-text>
        </button>
      </orio-long-press>
    </template>
    <template #content>
      <div class="user-peek">
        <orio-view-text type="title">{{ user.name }}</orio-view-text>
        <orio-view-text type="italics">{{ user.handle }}</orio-view-text>
        <orio-view-text>{{ user.bio }}</orio-view-text>
        <orio-view-text icon="map-pin">{{ user.location }}</orio-view-text>
      </div>
    </template>
  </orio-popover>
</template>
```

### Hold to confirm

```vue
<template>
  <orio-long-press
    :delay="1500"
    :scale="0.85"
    @trigger="deleteProject"
    @press-cancel="hintHoldLonger"
  >
    <orio-button icon="delete">Hold to delete project</orio-button>
  </orio-long-press>
</template>
```

## Props

| Prop            | Type      | Default | Description                                                    |
| --------------- | --------- | ------- | -------------------------------------------------------------- |
| `delay`         | `number`  | `500`   | Hold time in ms before `trigger`                               |
| `scale`         | `number`  | `0.95`  | Scale reached at the moment of trigger                         |
| `forceTouch`    | `boolean` | `true`  | Safari force click triggers immediately and suppresses Look Up |
| `disabled`      | `boolean` | `false` | No feedback, no events; normal clicks still work               |
| `moveTolerance` | `number`  | `10`    | Pointer movement in px that cancels the press                  |

## Events

| Event          | Payload                                                          | Description                          |
| -------------- | ---------------------------------------------------------------- | ------------------------------------ |
| `trigger`      | `(event: PointerEvent \| MouseEvent, source: "hold" \| "force")` | Hold reached `delay`, or force click |
| `press-start`  | `(event: PointerEvent)`                                          | Primary pointer went down            |
| `press-cancel` | —                                                                | Press ended without triggering       |

`trigger` passes the original event, so `@trigger="openModal"` animates the
modal from the pressed element.

## Behavior

- The click that follows a trigger is swallowed — the wrapped button does not
  also activate. A short press is a normal click.
- Keyboard activation (Enter / Space) is never swallowed.
- Only the left button / primary pointer counts. Ctrl+click (the macOS
  context-menu gesture) is ignored.
- Moving past `moveTolerance`, leaving the element, or a touch scroll cancels.
- While the finger is down — including after `trigger`, until release —
  text selection, the iOS callout and the native context menu are blocked.
  Text inside the wrapper stays selectable the rest of the time.
- With `prefers-reduced-motion: reduce` the scale is skipped; `trigger` still fires.

## Browser support

Long press works everywhere. Force click uses Safari's proprietary
`webkitmouseforce*` events — Chrome, Firefox and iOS do not expose trackpad or
screen pressure, so there it is a normal long press.

## Accessibility

There is no keyboard equivalent of a long press. Make sure the action behind
`trigger` is also reachable another way (a menu button, a shortcut).
