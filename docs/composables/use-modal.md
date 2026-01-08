# useModal

Composable for managing modal state with animated origin tracking.

## Live Demo

<script setup>
import { useModal } from '../../src/runtime/composables/useModal'

const { modalProps, openModal } = useModal()
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-button @click="openModal()">
      Open (No Animation)
    </orio-button>
  </div>

  <orio-modal v-bind="modalProps">
    <h2>Modal Content</h2>
    <p>Notice the difference in how the modal appears!</p>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</div>

<div class="demo-container">
  <div class="demo-row">
    <orio-button type="secondary" @click="openModal">
      Open (With Animation)
    </orio-button>
  </div>
</div>

## Basic Usage

```vue
<template>
  <div>
    <orio-button @click="openModal">Open Modal</orio-button>

    <orio-modal v-bind="modalProps">
      <h2>Modal Content</h2>
      <p>This is a modal dialog.</p>
      <orio-button @click="modalProps.show = false"> Close </orio-button>
    </orio-modal>
  </div>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

## Animation Control

The `openModal` function accepts an optional event parameter. How you call it determines the animation behavior:

### With Animation (Recommended)

Pass the event to create a morphing animation from the clicked element:

```vue
<template>
  <!-- Vue automatically passes the event -->
  <orio-button @click="openModal"> Open Modal (Animated) </orio-button>

  <!-- Or explicitly pass $event -->
  <orio-button @click="openModal($event)"> Open Modal (Animated) </orio-button>

  <orio-modal v-bind="modalProps">
    <p>Modal morphs from the button you clicked!</p>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Without Animation

Call the function with empty parentheses to skip animation:

```vue
<template>
  <orio-button @click="openModal()"> Open Modal (Simple Fade) </orio-button>

  <orio-modal v-bind="modalProps">
    <p>Modal fades in at center</p>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

### Comparison

```vue
<template>
  <div class="demo-row">
    <!-- No animation - () calls function without event -->
    <orio-button @click="openModal()"> Simple Fade-In </orio-button>

    <!-- With animation - Vue passes event automatically -->
    <orio-button @click="openModal"> Morphing Animation </orio-button>

    <!-- With animation - Explicit event passing -->
    <orio-button @click="openModal($event)">
      Morphing Animation (Explicit)
    </orio-button>
  </div>

  <orio-modal v-bind="modalProps">
    <h2>Modal Content</h2>
  </orio-modal>
</template>
```

**How it works:**

- `@click="openModal()"` → Calls without event → Modal fades in at center
- `@click="openModal"` → Vue passes event → Modal morphs from button position
- `@click="openModal($event)"` → Explicit event → Modal morphs from button position

## Return Values

| Property     | Type                           | Description                                |
| ------------ | ------------------------------ | ------------------------------------------ |
| `modalProps` | `Ref<ModalProps>`              | Props object to spread onto `<orio-modal>` |
| `openModal`  | `(event?: MouseEvent) => void` | Function to open the modal                 |

## ModalProps Type

```typescript
interface ModalProps {
  show: Boolean;
  origin: OriginRect | null;
  "onUpdate:show": (state: boolean) => void;
}

interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Examples

### Confirmation Dialog

```vue
<template>
  <orio-button type="primary" @click="confirmDelete($event)">
    Delete Item
  </orio-button>

  <orio-modal v-bind="deleteModal">
    <h3>Confirm Delete</h3>
    <p>Are you sure you want to delete this item?</p>

    <div style="display: flex; gap: 0.5rem; margin-top: 1rem">
      <orio-button type="secondary" @click="deleteModal.show = false">
        Cancel
      </orio-button>
      <orio-button type="primary" @click="handleDelete"> Delete </orio-button>
    </div>
  </orio-modal>
</template>

<script setup>
const { modalProps: deleteModal, openModal } = useModal();

function confirmDelete(event) {
  openModal(event);
}

function handleDelete() {
  // Perform delete
  deleteModal.value.show = false;
}
</script>
```

### Multiple Modals

```vue
<template>
  <div>
    <orio-button @click="openEditModal($event)">Edit</orio-button>
    <orio-button @click="openDeleteModal($event)">Delete</orio-button>

    <orio-modal v-bind="editModal">
      <h3>Edit Form</h3>
      <!-- Edit form -->
    </orio-modal>

    <orio-modal v-bind="deleteModal">
      <h3>Confirm Delete</h3>
      <!-- Confirmation -->
    </orio-modal>
  </div>
</template>

<script setup>
const { modalProps: editModal, openModal: openEditModal } = useModal();
const { modalProps: deleteModal, openModal: openDeleteModal } = useModal();
</script>
```

### Form in Modal

```vue
<template>
  <orio-button @click="openFormModal($event)"> Add User </orio-button>

  <orio-modal v-bind="formModal">
    <h2>New User</h2>

    <form @submit.prevent="handleSubmit">
      <orio-input v-model="form.name" label="Name" required />
      <orio-input v-model="form.email" type="email" label="Email" required />

      <div style="display: flex; gap: 0.5rem; margin-top: 1rem">
        <orio-button type="secondary" @click="formModal.show = false">
          Cancel
        </orio-button>
        <orio-button type="primary" :loading="submitting"> Save </orio-button>
      </div>
    </form>
  </orio-modal>
</template>

<script setup>
const { modalProps: formModal, openModal: openFormModal } = useModal();

const form = reactive({
  name: "",
  email: "",
});

const submitting = ref(false);

async function handleSubmit() {
  submitting.value = true;
  await api.createUser(form);
  submitting.value = false;
  formModal.value.show = false;

  // Reset form
  form.name = "";
  form.email = "";
}
</script>
```

## Animation Details

### How the Animation Works

When `openModal(event)` is called with a MouseEvent:

1. **Capture Origin** - The clicked element's bounding rectangle is captured (`getBoundingClientRect()`)
2. **Start Small** - Modal starts at the button's position and size with low opacity
3. **Morph to Center** - Modal animates to center screen with full size and opacity
4. **Result** - Smooth "expand from origin" effect that feels responsive and connected

Without an event (`openModal()`):

- Modal simply fades in at center position
- No morphing animation
- Simpler, faster for programmatic opens

### When to Use Each

**Use Animation (pass event):**

- User-triggered actions (clicks, taps)
- Creating visual connection between trigger and modal
- Enhancing user experience with smooth transitions

**Skip Animation (no event):**

- Programmatic opens (timers, API responses)
- Modals opened from non-visual triggers
- Performance-critical scenarios
- When trigger element position doesn't make sense as origin

## Usage with Modal Component

This composable is designed to work with `<orio-modal>`:

```vue
<orio-modal v-bind="modalProps">
  <!-- Content -->
</orio-modal>
```

The `v-bind="modalProps"` spreads all necessary props:

- `show` - Controls visibility
- `origin` - Animation origin rect
- `onUpdate:show` - Updates show state when modal closes

## Quick Reference

```vue
<script setup>
const { modalProps, openModal } = useModal();
</script>

<template>
  <!-- Simple fade-in (no animation) -->
  <button @click="openModal()">Open</button>

  <!-- Morphing animation from button -->
  <button @click="openModal">Open with Animation</button>

  <!-- Programmatic open after some action -->
  <button
    @click="
      async () => {
        await saveData();
        openModal(); // No animation for programmatic opens
      }
    "
  >
    Save & Open
  </button>

  <!-- The modal itself -->
  <orio-modal v-bind="modalProps">
    <h2>Title</h2>
    <p>Content</p>
    <button @click="modalProps.show = false">Close</button>
  </orio-modal>
</template>
```

## Common Patterns

### Confirmation Before Action

```vue
<script setup>
const { modalProps: confirmModal, openModal: openConfirm } = useModal();

async function handleDangerousAction(event) {
  openModal(event);
}

async function proceedWithAction() {
  await performAction();
  confirmModal.value.show = false;
}
</script>

<template>
  <orio-button type="primary" @click="handleDangerousAction">
    Delete
  </orio-button>

  <orio-modal v-bind="confirmModal">
    <h3>Are you sure?</h3>
    <p>This action cannot be undone.</p>
    <div class="demo-row">
      <orio-button type="secondary" @click="confirmModal.show = false">
        Cancel
      </orio-button>
      <orio-button type="primary" @click="proceedWithAction">
        Confirm
      </orio-button>
    </div>
  </orio-modal>
</template>
```

### Programmatic Open (No Animation)

```vue
<script setup>
const { modalProps, openModal } = useModal();

async function loadAndShowDetails(id) {
  const data = await api.fetch(id);
  // No animation - triggered by data fetch, not user click
  openModal();
}
</script>
```

## See Also

- [Modal Component](/components/modal)
