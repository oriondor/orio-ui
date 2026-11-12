# Modal

Animated modal with origin morphing effect.

## Live Demo

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
const modalOrigin = ref(null)
const showSheet = ref(false)
const showAuto = ref(false)

function openModal(event) {
  const rect = event.target.getBoundingClientRect()
  modalOrigin.value = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
  showModal.value = true
}
</script>

<div class="demo-container">
  <orio-button @click="openModal">
    Open Modal
  </orio-button>

  <orio-modal v-model:show="showModal" :origin="modalOrigin" title="Demo modal">
    <div style="width: 50rem">
      <p>This modal morphs from the button you clicked!</p>
      <p>Click outside or press the button below to close.</p>
      <p>Style it however you want basically</p>
      <br>
      <i>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
      </i>
    </div>
    <template #footer>
      <orio-button variant="primary" @click="showModal = false">
        Close Modal
      </orio-button>
    </template>
  </orio-modal>
</div>

## Sheet demo

<div class="demo-container">
  <orio-button @click="showSheet = true">
    Open sheet
  </orio-button>

  <orio-modal v-model:show="showSheet" :origin="null" presentation="sheet" drag-handle title="Sheet">
    <p>Docked to the bottom, slides up, ignores origin.</p>
    <template #footer>
      <orio-button variant="primary" @click="showSheet = false">
        Close
      </orio-button>
    </template>
  </orio-modal>
</div>

## Auto demo

<div class="demo-container">
  <orio-button @click="showAuto = true">
    Open auto
  </orio-button>

  <orio-modal v-model:show="showAuto" :origin="null" presentation="auto" title="Auto">
    <p>Sheet under 640px, dialog above; fixed while open.</p>
    <template #footer>
      <orio-button variant="primary" @click="showAuto = false">
        Close
      </orio-button>
    </template>
  </orio-modal>
</div>

## Usage

### Basic Modal (Manual State)

If `title` not provided - header not drawn;

You can control width of the modal with width of inner content

```vue
<template>
  <orio-button @click="showModal = true"> Open </orio-button>

  <orio-modal v-model:show="showModal" :origin="null" title="Modal title">
    <p style="width: 50rem;">Your content here</p>
  </orio-modal>
</template>

<script setup>
const showModal = ref(false);
</script>
```

### Using useModal Composable (Recommended)

The `useModal()` composable simplifies modal management and automatically handles animation origins:

```vue
<template>
  <orio-button @click="openModal"> Open Modal </orio-button>

  <orio-modal v-bind="modalProps">
    <h2>Modal Title</h2>
    <p>Content here</p>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Animation Control: With vs Without Event

The key difference between `openModal()` and `openModal` is how the click event is handled:

```vue
<template>
  <div class="demo-row">
    <!-- NO Animation - Calling with () without passing event -->
    <orio-button @click="openModal()"> Open Modal (No Animation) </orio-button>

    <!-- WITH Animation - Passing event automatically -->
    <orio-button @click="openModal"> Open Modal (With Animation) </orio-button>

    <!-- WITH Animation - Explicitly passing event -->
    <orio-button @click="openModal($event)">
      Open Modal (Explicit Event)
    </orio-button>
  </div>

  <orio-modal v-bind="modalProps">
    <h2>Modal Content</h2>
    <p>This modal may or may not animate based on how it was opened!</p>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

**Explanation:**

- `@click="openModal()"` - Calls the function immediately, no event is passed → **Simple fade-in**
- `@click="openModal"` - Vue passes the click event automatically → **Morphing animation from button**
- `@click="openModal($event)"` - Explicitly passes the event → **Morphing animation from button**

### Manual Origin Tracking (Without useModal)

If you need more control, you can manually track the origin:

```vue
<template>
  <orio-button @click="openModal"> Open with Animation </orio-button>

  <orio-modal v-model:show="showModal" :origin="origin">
    <p>Morphs from button!</p>
  </orio-modal>
</template>

<script setup>
const showModal = ref(false);
const origin = ref(null);

function openModal(event) {
  const rect = event.target.getBoundingClientRect();
  origin.value = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
  showModal.value = true;
}
</script>
```

### Bottom sheet

`presentation="sheet"` docks the modal to the bottom edge at full width with rounded top corners. It slides up on open and down on close (under `prefers-reduced-motion` it opens and closes instantly) and ignores `origin`. Header and footer stay pinned while the content scrolls. Footer buttons sit side by side in a row and wrap with a gap on narrow screens. `drag-handle` adds a decorative grip (`aria-hidden`, no gesture).

```vue
<template>
  <orio-button @click="showSheet = true"> Open sheet </orio-button>

  <orio-modal
    v-model:show="showSheet"
    :origin="null"
    presentation="sheet"
    drag-handle
    title="Sheet"
  >
    <p>Docked to the bottom, slides up, ignores origin.</p>
    <template #footer>
      <orio-button variant="primary" @click="showSheet = false">
        Close
      </orio-button>
    </template>
  </orio-modal>
</template>

<script setup>
const showSheet = ref(false);
</script>
```

`presentation="auto"` picks a sheet below 640px (Tailwind `sm`) and a dialog otherwise. The mode is decided when the modal opens and kept until it closes: resizing across 640px while open does not switch it.

```vue
<orio-button @click="showAuto = true">
  Open auto
</orio-button>

<orio-modal
  v-model:show="showAuto"
  :origin="null"
  presentation="auto"
  title="Auto"
>
  <p>Sheet under 640px, dialog above; fixed while open.</p>
  <template #footer>
    <orio-button variant="primary" @click="showAuto = false">
      Close
    </orio-button>
  </template>
</orio-modal>
```

### Styling

`class`, `style` and other attrs on `<orio-modal>` land on the `.modal` dialog element. It carries `data-presentation="sheet" | "dialog"` (the resolved mode, never `auto`), so per-mode styling needs no `:has()`. Tokens below can be set on `.modal` or any ancestor of the teleport target (e.g. `:root`). In a sheet, `env(safe-area-inset-bottom)` pads the last block; it only reports a value when the page sets `viewport-fit=cover` in its viewport meta.

```css
.modal[data-presentation="sheet"] {
  --modal-radius: 24px;
}
```

## Props

| Prop           | Type                            | Default                  | Description                                                                            |
| -------------- | ------------------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| `show`         | `Boolean`                       | -                        | Modal visibility (v-model:show)                                                        |
| `origin`       | `OriginRect \| null`            | `null`                   | Animation origin point                                                                 |
| `presentation` | `'dialog' \| 'sheet' \| 'auto'` | `'dialog'`               | `dialog` centered, `sheet` docked bottom, `auto` = sheet under 640px, resolved on open |
| `dragHandle`   | `boolean`                       | `false`                  | Decorative grip on a sheet (`aria-hidden`, no gesture)                                 |
| `duration`     | `number`                        | `500` open / `400` close | Open and close animation length in ms. Reduced motion ignores it                       |

### CSS tokens

| Token                     | Default                   | Description                                    |
| ------------------------- | ------------------------- | ---------------------------------------------- |
| `--modal-min-inline-size` | `380px`                   | Dialog minimum width, capped at `100% - 2rem`  |
| `--modal-max-inline-size` | `90vw`                    | Dialog maximum width, capped at `100% - 2rem`  |
| `--modal-max-block-size`  | `90dvh`                   | Sheet maximum height                           |
| `--modal-radius`          | `var(--border-radius-lg)` | Corner radius (dialog; top corners of a sheet) |

### OriginRect Type

```typescript
interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Events

| Event         | Payload   | Description               |
| ------------- | --------- | ------------------------- |
| `update:show` | `boolean` | Emitted when modal closes |

## Features

- Click outside or press `Esc` to close
- Footer children are flex items (dialog and sheet): a wrapper element needs `flex: 1` or `width: 100%` to span the footer
- `role="dialog"` with `aria-modal`, labelled by `title`
- Moves focus into the dialog, keeps `Tab` inside, returns focus to the
  element focused before opening
- Backdrop blur effect
- Morphing animation from origin element
- Smooth fade-in when no origin provided
- Reduced motion (`prefers-reduced-motion`): no animation, the modal opens and closes instantly
- Locks page scroll while open without layout shift: `<body>` is padded by the
  scrollbar width

### Fixed-position elements

Body padding does not reach `position: fixed` elements, so a fixed header
still shifts when the scrollbar disappears. While a modal is open, the
scrollbar width is exposed on `<html>` as `--orio-scrollbar-gap`:

```css
.site-header {
  position: fixed;
  padding-right: var(--orio-scrollbar-gap, 0px);
}
```
