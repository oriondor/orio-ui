# Taggable Selector

A searchable multi-select dropdown that displays selected options as tags inside the trigger, and can emit a `create` event when the user types a value that isn't in the list. Built on top of [Selector](/components/selector) and [Tag](/components/tag).

## Live Demo

<script setup>
import { ref } from 'vue'

const selectedUsers = ref([])
const users = [
  { id: 1, text: 'John Doe', variant: 'accent' },
  { id: 2, text: 'Jane Smith', variant: 'accent' },
  { id: 3, text: 'Bob Johnson', variant: 'neutral' },
  { id: 4, text: 'Alice Williams', variant: 'accent' }
]

// Creatable demo
const frameworks = ref([
  { id: 'vue', text: 'Vue', variant: 'accent' },
  { id: 'react', text: 'React', variant: 'neutral' },
  { id: 'svelte', text: 'Svelte', variant: 'neutral' }
])
const selectedFrameworks = ref([])
const frameworkSearch = ref('')

function createFramework(text) {
  const option = { id: text.toLowerCase(), text, variant: 'accent' }
  frameworks.value.push(option)
  selectedFrameworks.value.push(option)
}
</script>

### Basic

<div class="demo-container">
  <orio-taggable-selector
    v-model="selectedUsers"
    :options="users"
    :allow-create="false"
    placeholder="Select users"
  />

  <div class="demo-output">
    <strong>Selected:</strong> {{ selectedUsers.length > 0 ? selectedUsers.map(u => u.text).join(', ') : 'None' }}
  </div>
</div>

### Creatable

Type a value that isn't in the list, then either click the **Create "…"** button or press <kbd>Enter</kbd> while nothing matches. The `@create` handler decides what to do with the new value.

<div class="demo-container">
  <orio-taggable-selector
    v-model="selectedFrameworks"
    v-model:search="frameworkSearch"
    :options="frameworks"
    label="Frameworks"
    placeholder="Search or create a framework"
    @create="createFramework"
  />

  <div class="demo-output">
    <strong>Selected:</strong> {{ selectedFrameworks.length > 0 ? selectedFrameworks.map(f => f.text).join(', ') : 'None' }}
  </div>
</div>

## Usage

### Basic (select only)

Pass `:allow-create="false"` when the list is fixed and users should not add new options.

```vue
<script setup>
const selected = ref([]);
const options = [
  { id: 1, text: "Option A", variant: "accent" },
  { id: 2, text: "Option B", variant: "neutral" },
];
</script>

<template>
  <orio-taggable-selector
    v-model="selected"
    :options="options"
    :allow-create="false"
    placeholder="Select options"
  />
</template>
```

### Creatable with a custom label key

`field` and `option-name` let you use any option shape — they default to `"id"` and `"text"`.

```vue
<script setup>
const allSkills = ref([
  { id: "vue", name: "Vue" },
  { id: "nuxt", name: "Nuxt" },
]);
const selected = ref([]);
const search = ref("");

function createSkill(name) {
  const skill = { id: name.toLowerCase(), name };
  allSkills.value.push(skill);
  selected.value.push(skill);
}
</script>

<template>
  <orio-taggable-selector
    v-model="selected"
    v-model:search="search"
    :options="allSkills"
    field="id"
    option-name="name"
    label="Skills"
    @create="createSkill"
  />
</template>
```

## How It Works

TaggableSelector wraps [Selector](/components/selector) with `multiple` forced on. The trigger renders each selected option as an `<orio-tag>` plus a search `<input>`. As you type, the option list is fuzzy-filtered (via `useFuzzySearch`, keyed on `optionName`). Selecting an option checks it in the dropdown and adds a chip to the trigger.

The **create flow** is opt-out. When `allow-create` is `true` (the default) and the search text is non-empty and does not exactly match an existing option, a sticky **"Create …"** button appears at the bottom of the dropdown. The component emits `@create(searchText)` when:

- the **Create** button is clicked, or
- the user presses <kbd>Enter</kbd> **while no options match** the search.

If matches are visible, <kbd>Enter</kbd> selects the highlighted option instead of creating. When the search matches nothing, the dropdown shows a **"No matches found"** empty state above the Create button. On create, the search input is cleared.

`@create` does not mutate `options` or the selection — the parent owns persistence. Push the new option into your list (and into `v-model`, if it should be selected) inside the handler, as the examples above do.

## Keyboard

The dropdown reuses [Selector](/components/selector)'s roving-list navigation, so it is keyboard-operable just like a plain multi-select:

- <kbd>↓</kbd> / <kbd>↑</kbd> — move the highlighted option (opening the list seeds the highlight, so the first press has an anchor).
- <kbd>Enter</kbd> — select the highlighted option; or, when nothing matches, create (see above).
- <kbd>Esc</kbd> — close the dropdown.

Typing keys stay with the search input — only arrows and <kbd>Esc</kbd> drive the list while the input is focused.

## Props

Inherits all [Selector](/components/selector) props except `multiple` (always `true`).

| Prop          | Type                     | Default            | Description                                                             |
| ------------- | ------------------------ | ------------------ | ---------------------------------------------------------------------- |
| `options`     | `SelectableOption[]`     | —                  | Options to select from (strings or objects).                           |
| `field`       | `string`                 | `'id'`             | Key used as the unique identifier on object options.                   |
| `optionName`  | `string`                 | `'text'`           | Key used for the visible label and fuzzy search on object options.     |
| `placeholder` | `string`                 | i18n default       | Placeholder shown in the search input when nothing is selected.        |
| `tagVariant`  | `'neutral' \| 'accent'`  | —                  | Variant applied to **every** chip (there is no per-option variant).    |
| `allowCreate` | `boolean`                | `true`             | Show the "Create …" button and allow Enter-to-create. `false` disables it. |
| `label`       | `string`                 | —                  | Label text (passed through to ControlElement).                          |
| `size`        | `'xs'…'xl'`              | inherited          | Control size (passed through to ControlElement).                        |

## Models

| Model          | Type                 | Default | Description                                            |
| -------------- | -------------------- | ------- | ----------------------------------------------------- |
| `v-model`      | `SelectableOption[]` | `[]`    | Two-way binding for the selected options array.       |
| `v-model:search` | `string`           | `''`    | Two-way binding for the search input. Cleared on create. |

## Events

| Event    | Payload  | Description                                                                                  |
| -------- | -------- | ------------------------------------------------------------------------------------------- |
| `create` | `string` | The user asked to create a new option (Create button, or Enter with no matches). The search text. |

## i18n

| Key                         | English            |
| --------------------------- | ------------------ |
| `taggableSelector.placeholder` | `Select options`   |
| `taggableSelector.create`   | `Create "{search}"` |
| `taggableSelector.noMatches` | `No matches found` |

## Styling

Selected tags wrap inside the trigger with `flex-wrap`:

```css
--color-accent-soft   /* Accent tag background */
--color-accent-border /* Accent tag border */
--color-surface       /* Neutral tag background */
--color-border        /* Neutral tag border */
```
