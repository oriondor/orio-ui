# Selector

Generic dropdown selector supporting both single and multi-select modes with custom option rendering.

## Live Demo

<script setup>
import { nextTick, ref } from 'vue'
import { useFuzzySearch } from '../../src/runtime/composables/useFuzzySearch'

// Simple string array
const selectedCountry = ref(null)
const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan']

// Multiple selection
const selectedColors = ref([])
const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange']

// Object array with custom fields
const selectedUser = ref(null)
const users = [
  { id: 1, name: 'John Doe', role: 'Admin' },
  { id: 2, name: 'Jane Smith', role: 'User' },
  { id: 3, name: 'Bob Johnson', role: 'Manager' },
  { id: 4, name: 'Alice Williams', role: 'User' }
]

const channels = [
  { id: 'mail', name: 'Email', icon: 'mail' },
  { id: 'phone', name: 'Phone', icon: 'phone' },
  { id: 'chat', name: 'Chat', icon: 'chat' },
  { id: 'message', name: 'Message', icon: 'message' }
]
const optionChannel = ref(null)
const triggerChannel = ref(null)

const tagItems = [
  { id: 1, label: 'Urgent' },
  { id: 2, label: 'Billing' },
  { id: 3, label: 'Bug' },
  { id: 4, label: 'Feature' },
  { id: 5, label: 'Docs' }
]
const selectedTags = ref([])
const tagsTrigger = ref(null)
async function removeTag(tag) {
  const index = selectedTags.value.findIndex((item) => item.id === tag.id)
  selectedTags.value = selectedTags.value.filter((item) => item.id !== tag.id)
  await nextTick()
  const buttons = tagsTrigger.value.querySelectorAll('button')
  const next = buttons[index] ?? buttons[index - 1] ?? tagsTrigger.value
  next.focus()
}

const people = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer' },
  { id: 2, name: 'Grace Hopper', role: 'Admiral' },
  { id: 3, name: 'Alan Turing', role: 'Mathematician' },
  { id: 4, name: 'Katherine Johnson', role: 'Analyst' },
  { id: 5, name: 'Linus Torvalds', role: 'Maintainer' }
]
const search = ref('')
const matchedPeople = useFuzzySearch(people, search, { keys: ['name'], threshold: 0.3 })
const searchedPerson = ref(null)

const richUser = ref(null)

const emptyTeam = ref(null)
const sizedCountry = ref(null)
const disabledCountry = ref(null)
</script>

### Single Select (Strings)

<div class="demo-container">
  <orio-selector
    v-model="selectedCountry"
    :options="countries"
    placeholder="Select a country"
  />

  <div class="demo-output">
    <strong>Selected:</strong> {{ selectedCountry || 'None' }}
  </div>
</div>

### Multiple Select

<div class="demo-container">
  <orio-selector
    v-model="selectedColors"
    :options="colors"
    placeholder="Select colors"
    :multiple="true"
  />

  <div class="demo-output">
    <strong>Selected:</strong> {{ selectedColors.length > 0 ? selectedColors.join(', ') : 'None' }}
  </div>
</div>

### Object Array with Custom Fields

<div class="demo-container">
  <orio-selector
    v-model="selectedUser"
    :options="users"
    field="id"
    option-name="name"
    placeholder="Select a user"
  />

  <div class="demo-output">
    <strong>Selected User:</strong>
    <template v-if="selectedUser">
      {{ selectedUser.name }} ({{ selectedUser.role }})
    </template>
    <template v-else>
      None
    </template>
  </div>
</div>

## Slots in Action

The demos below use the real slots. Each snippet is the demo markup.

### Options with icons

<div class="demo-container">
<orio-selector v-model="optionChannel" :options="channels" field="id" option-name="name" placeholder="Select a channel">
  <template #option="{ option }">
    <orio-view-text :icon="option.icon">{{ option.name }}</orio-view-text>
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Selected:</strong> {{ optionChannel?.name || 'None' }}
</div>
</div>

```vue
<orio-selector v-model="optionChannel" :options="channels" field="id" option-name="name" placeholder="Select a channel">
  <template #option="{ option }">
    <orio-view-text :icon="option.icon">{{ option.name }}</orio-view-text>
  </template>
</orio-selector>
```

### Trigger with icon

<div class="demo-container">
<orio-selector v-model="triggerChannel" :options="channels" field="id" option-name="name" placeholder="Select a channel">
  <template #trigger-label="{ getOptionLabel }">
    <orio-view-text :icon="triggerChannel?.icon">{{ getOptionLabel(triggerChannel) }}</orio-view-text>
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Selected:</strong> {{ triggerChannel?.name || 'None' }}
</div>
</div>

```vue
<orio-selector v-model="triggerChannel" :options="channels" field="id" option-name="name" placeholder="Select a channel">
  <template #trigger-label="{ getOptionLabel }">
    <orio-view-text :icon="triggerChannel?.icon">{{ getOptionLabel(triggerChannel) }}</orio-view-text>
  </template>
</orio-selector>
```

### Multi-select with tag chips

The default button cannot hold interactive children, so chip removal uses a custom `#trigger`. `<orio-tag removable>` renders a native remove button that stops its own click and Enter/Space events, so removing a chip never toggles the list. The trigger takes `aria-controls` from the `listboxId` slot prop and honours `disabled` from the `control` bag. After a removal, focus moves to the next chip's remove button, else the previous one, else the trigger.

<div class="demo-container">
<orio-selector v-model="selectedTags" :options="tagItems" multiple field="id" option-name="label" placeholder="Select tags" aria-label="Select tags">
  <template #trigger="{ toggle, control, attrs, isOpen, listboxId, triggerKeydown, getOptionKey, getOptionLabel }">
    <div ref="tagsTrigger" v-bind="{ ...attrs, ...control }" class="demo-tags-trigger" role="combobox" :tabindex="control.disabled ? undefined : (control.tabindex ?? 0)" :aria-disabled="control.disabled || undefined" aria-haspopup="listbox" :aria-expanded="isOpen" :aria-controls="listboxId" @click="!control.disabled && toggle()" @keydown="!control.disabled && triggerKeydown($event)">
      <span v-if="!selectedTags.length" class="demo-tags-placeholder">{{ getOptionLabel(undefined) }}</span>
      <orio-tag v-for="tag in selectedTags" :key="getOptionKey(tag)" :text="getOptionLabel(tag)" :removable="!control.disabled" @remove="removeTag(tag)" />
      <orio-icon name="chevron-down" class="demo-tags-chevron" />
    </div>
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Selected:</strong> {{ selectedTags.map((tag) => tag.label).join(', ') || 'None' }}
</div>
</div>

```vue
<template>
<orio-selector v-model="selectedTags" :options="tagItems" multiple field="id" option-name="label" placeholder="Select tags" aria-label="Select tags">
  <template #trigger="{ toggle, control, attrs, isOpen, listboxId, triggerKeydown, getOptionKey, getOptionLabel }">
    <div ref="tagsTrigger" v-bind="{ ...attrs, ...control }" class="demo-tags-trigger" role="combobox" :tabindex="control.disabled ? undefined : (control.tabindex ?? 0)" :aria-disabled="control.disabled || undefined" aria-haspopup="listbox" :aria-expanded="isOpen" :aria-controls="listboxId" @click="!control.disabled && toggle()" @keydown="!control.disabled && triggerKeydown($event)">
      <span v-if="!selectedTags.length" class="demo-tags-placeholder">{{ getOptionLabel(undefined) }}</span>
      <orio-tag v-for="tag in selectedTags" :key="getOptionKey(tag)" :text="getOptionLabel(tag)" :removable="!control.disabled" @remove="removeTag(tag)" />
      <orio-icon name="chevron-down" class="demo-tags-chevron" />
    </div>
  </template>
</orio-selector>
</template>

<script setup>
import { nextTick, ref } from 'vue'
const tagItems = [
  { id: 1, label: 'Urgent' },
  { id: 2, label: 'Billing' },
  { id: 3, label: 'Bug' },
  { id: 4, label: 'Feature' },
  { id: 5, label: 'Docs' }
]
const selectedTags = ref([])
const tagsTrigger = ref(null)
async function removeTag(tag) {
  const index = selectedTags.value.findIndex((item) => item.id === tag.id)
  selectedTags.value = selectedTags.value.filter((item) => item.id !== tag.id)
  await nextTick()
  const buttons = tagsTrigger.value.querySelectorAll('button')
  const next = buttons[index] ?? buttons[index - 1] ?? tagsTrigger.value
  next.focus()
}
</script>
```

```vue
<style scoped>
.demo-tags-trigger {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.5rem;
  cursor: pointer;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  color: var(--color-text);
}
.demo-tags-trigger:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.demo-tags-trigger[aria-disabled="true"] {
  background-color: var(--color-surface);
  color: var(--color-muted);
  cursor: not-allowed;
}
.demo-tags-placeholder {
  color: var(--color-muted);
}
.demo-tags-chevron {
  margin-left: auto;
  color: var(--color-muted);
}
</style>
```

### Searchable

The filter lives outside the Selector: `useFuzzySearch` narrows `:options`, the v-model keeps the chosen person even while filtered out.

<div class="demo-container">
<orio-selector v-model="searchedPerson" :options="matchedPeople" field="id" option-name="name" placeholder="Select a person">
  <template #no-options>
    <orio-empty-state title="No one matches" description="Try a different search." size="small" />
  </template>
  <template #options-addon>
    <orio-input v-model="search" aria-label="Search people" placeholder="Search people" />
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Selected:</strong> {{ searchedPerson?.name || 'None' }}
</div>
</div>

```vue
<orio-selector v-model="searchedPerson" :options="matchedPeople" field="id" option-name="name" placeholder="Select a person">
  <template #no-options>
    <orio-empty-state title="No one matches" description="Try a different search." size="small" />
  </template>
  <template #options-addon>
    <orio-input v-model="search" aria-label="Search people" placeholder="Search people" />
  </template>
</orio-selector>
```

### Rich option rows

<div class="demo-container">
<orio-selector v-model="richUser" :options="people" field="id" option-name="name" placeholder="Select a user">
  <template #option="{ option }">
    <div>
      <orio-view-text type="title" size="small">{{ option.name }}</orio-view-text>
      <orio-view-text size="small" style="--view-text-color: var(--color-muted)">{{ option.role }}</orio-view-text>
    </div>
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Selected:</strong> {{ richUser?.name || 'None' }}
</div>
</div>

```vue
<orio-selector v-model="richUser" :options="people" field="id" option-name="name" placeholder="Select a user">
  <template #option="{ option }">
    <div>
      <orio-view-text type="title" size="small">{{ option.name }}</orio-view-text>
      <orio-view-text size="small" style="--view-text-color: var(--color-muted)">{{ option.role }}</orio-view-text>
    </div>
  </template>
</orio-selector>
```

### Custom empty state

<div class="demo-container">
<orio-selector v-model="emptyTeam" :options="[]" placeholder="Select a team">
  <template #no-options>
    <orio-empty-state icon="info" title="No teams yet" description="Create a team to see it here." size="small" />
  </template>
</orio-selector>

</div>

```vue
<orio-selector v-model="emptyTeam" :options="[]" placeholder="Select a team">
  <template #no-options>
    <orio-empty-state icon="info" title="No teams yet" description="Create a team to see it here." size="small" />
  </template>
</orio-selector>
```

### Sizes

<div class="demo-container">
<orio-selector v-model="sizedCountry" :options="countries" size="xs" placeholder="xs" />
<orio-selector v-model="sizedCountry" :options="countries" size="sm" placeholder="sm" />
<orio-selector v-model="sizedCountry" :options="countries" size="md" placeholder="md" />
<orio-selector v-model="sizedCountry" :options="countries" size="lg" placeholder="lg" />
<orio-selector v-model="sizedCountry" :options="countries" size="xl" placeholder="xl" />
</div>

```vue
<orio-selector v-model="sizedCountry" :options="countries" size="xs" placeholder="xs" />
<orio-selector v-model="sizedCountry" :options="countries" size="sm" placeholder="sm" />
<orio-selector v-model="sizedCountry" :options="countries" size="md" placeholder="md" />
<orio-selector v-model="sizedCountry" :options="countries" size="lg" placeholder="lg" />
<orio-selector v-model="sizedCountry" :options="countries" size="xl" placeholder="xl" />
```

### Disabled

A disabled selector is not focusable and does not open.

<div class="demo-container">
<orio-selector v-model="disabledCountry" :options="countries" disabled placeholder="Select a country" />

</div>

```vue
<orio-selector v-model="disabledCountry" :options="countries" disabled placeholder="Select a country" />
```

<style scoped>
.demo-tags-trigger {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.5rem;
  cursor: pointer;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  color: var(--color-text);
}
.demo-tags-trigger:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.demo-tags-trigger[aria-disabled="true"] {
  background-color: var(--color-surface);
  color: var(--color-muted);
  cursor: not-allowed;
}
.demo-tags-placeholder {
  color: var(--color-muted);
}
.demo-tags-chevron {
  margin-left: auto;
  color: var(--color-muted);
}
</style>

## Usage

### Simple String Array

```vue
<template>
  <orio-selector
    v-model="selected"
    :options="['Option 1', 'Option 2', 'Option 3']"
    placeholder="Select an option"
  />
</template>

<script setup>
const selected = ref(null)
</script>
```

### Object Array

```vue
<template>
  <orio-selector
    v-model="selectedUser"
    :options="users"
    field="id"
    option-name="name"
  />
</template>

<script setup>
const selectedUser = ref(null)
const users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
]
</script>
```

### Multiple Selection

```vue
<orio-selector
  v-model="selected"
  :options="options"
  :multiple="true"
/>
```

### Custom Option Rendering

```vue
<orio-selector v-model="selected" :options="users">
  <template #option="{ option }">
    <div style="display: flex; justify-content: space-between;">
      <strong>{{ option.name }}</strong>
      <span style="color: gray;">{{ option.role }}</span>
    </div>
  </template>
</orio-selector>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<string \| object>` | - | Array of options to select from |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `field` | `string` | `'id'` | Key field for object options (used as unique identifier) |
| `optionName` | `string` | `undefined` | Field to display for object options |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any \| any[]` | Emitted when selection changes |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `trigger` | `{ toggle, control, isOpen, listboxId, triggerKeydown, selectHighlighted, getOptionKey, getOptionLabel, attrs }` | Custom trigger element |
| `trigger-content` | `{ toggle, getOptionKey, getOptionLabel, attrs }` | Custom trigger content |
| `trigger-label` | `{ toggle, getOptionKey, getOptionLabel, attrs }` | Custom trigger label text |
| `option` | `{ option, toggle, selected, getOptionKey, getOptionLabel }` | Custom option rendering |
| `no-options` | - | Custom empty state when no options |
| `options-addon` | - | Additional content at bottom of dropdown. Tab from the open trigger moves into it; ArrowUp/ArrowDown and Enter in a text field drive the list; Shift+Tab and Escape return to the trigger |

## Attributes

Attributes that are not props (`data-*`, `title`, `aria-describedby`, …) are
forwarded to the trigger `<button>`; `class` and `style` also apply to the
`.control` wrapper.

```vue
<orio-selector
  v-model="country"
  :options="countries"
  data-testid="country-selector"
  title="Pick a country"
/>
```

A custom `#trigger` replaces that button, so bind the attrs yourself:

```vue
<orio-selector v-model="country" :options="countries" data-testid="country">
  <template #trigger="{ toggle, control, attrs, triggerKeydown }">
    <button v-bind="{ ...attrs, ...control }" @click="toggle()" @keydown="triggerKeydown">
      {{ country ?? "Pick a country" }}
    </button>
  </template>
</orio-selector>
```

## TypeScript

The Selector component supports TypeScript generics:

```typescript
interface User {
  id: number
  name: string
  role: string
}

const selectedUser = ref<User | null>(null)
```

## Styling

```css
--color-bg           /* Dropdown background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Selected item background */
--color-surface      /* Hover background */
```
