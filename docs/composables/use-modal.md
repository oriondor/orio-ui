# useModal

Composable for managing modal state with animated origin tracking.

## Basic Usage

```vue
<template>
  <div>
    <orio-button @click="openModal">Open Modal</orio-button>

    <orio-modal v-bind="modalProps">
      <h2>Modal Content</h2>
      <p>This is a modal dialog.</p>
      <orio-button @click="modalProps.show = false">
        Close
      </orio-button>
    </orio-modal>
  </div>
</template>

<script setup>
const { modalProps, openModal } = useModal()
</script>
```

## With Animation Origin

Pass the click event to create a morphing animation from the trigger element:

```vue
<template>
  <orio-button @click="openModal($event)">
    Animated Open
  </orio-button>

  <orio-modal v-bind="modalProps">
    <p>Modal animates from button position</p>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal()
</script>
```

## Return Values

| Property | Type | Description |
|----------|------|-------------|
| `modalProps` | `Ref<ModalProps>` | Props object to spread onto `<orio-modal>` |
| `openModal` | `(event?: MouseEvent) => void` | Function to open the modal |

## ModalProps Type

```typescript
interface ModalProps {
  show: Boolean
  origin: OriginRect | null
  'onUpdate:show': (state: boolean) => void
}

interface OriginRect {
  x: number
  y: number
  width: number
  height: number
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
      <orio-button type="primary" @click="handleDelete">
        Delete
      </orio-button>
    </div>
  </orio-modal>
</template>

<script setup>
const { modalProps: deleteModal, openModal } = useModal()

function confirmDelete(event) {
  openModal(event)
}

function handleDelete() {
  // Perform delete
  deleteModal.value.show = false
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
const { modalProps: editModal, openModal: openEditModal } = useModal()
const { modalProps: deleteModal, openModal: openDeleteModal } = useModal()
</script>
```

### Form in Modal

```vue
<template>
  <orio-button @click="openFormModal($event)">
    Add User
  </orio-button>

  <orio-modal v-bind="formModal">
    <h2>New User</h2>

    <form @submit.prevent="handleSubmit">
      <orio-input v-model="form.name" label="Name" required />
      <orio-input v-model="form.email" type="email" label="Email" required />

      <div style="display: flex; gap: 0.5rem; margin-top: 1rem">
        <orio-button type="secondary" @click="formModal.show = false">
          Cancel
        </orio-button>
        <orio-button type="primary" :loading="submitting">
          Save
        </orio-button>
      </div>
    </form>
  </orio-modal>
</template>

<script setup>
const { modalProps: formModal, openModal: openFormModal } = useModal()

const form = reactive({
  name: '',
  email: ''
})

const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  await api.createUser(form)
  submitting.value = false
  formModal.value.show = false

  // Reset form
  form.name = ''
  form.email = ''
}
</script>
```

## Animation Details

When `openModal(event)` is called with a MouseEvent:
1. The clicked element's position and size are captured
2. The modal starts at that position/size with low opacity
3. It morphs to the center of the screen with full size/opacity
4. Creates a smooth "expand from origin" effect

Without an event, the modal fades in at center position.

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

## See Also

- [Modal Component](/components/modal)
