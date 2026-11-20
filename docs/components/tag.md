# Tag

Styled tag/badge component.

## Live Demo

<script setup>
import { nextTick, ref } from 'vue'
const removableTags = ref(['Vue', 'Nuxt', 'Vite'])
const removableRow = ref(null)
async function removeTag(tag) {
  const index = removableTags.value.indexOf(tag)
  removableTags.value = removableTags.value.filter((item) => item !== tag)
  await nextTick()
  const buttons = removableRow.value.querySelectorAll('button')
  ;(buttons[index] ?? buttons[index - 1])?.focus()
}
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-tag text="Default Tag" />
    <orio-tag text="Accent Tag" variant="accent" />
    <orio-tag text="Neutral Tag" variant="neutral" />
  </div>

  <div class="demo-row" style="margin-top: 1rem;">
    <orio-tag text="React" />
    <orio-tag text="Vue" />
    <orio-tag text="Angular" />
    <orio-tag text="Svelte" />
  </div>
</div>

## Usage

```vue
<template>
  <div>
    <orio-tag text="JavaScript" />
    <orio-tag text="Featured" variant="accent" />
  </div>
</template>
```

## Removable

`removable` renders a native remove button with a translated label
(`Remove {text}`). The button emits `remove`; its click and Enter/Space key events do
not reach a parent trigger; Tab and Escape still bubble.

<div class="demo-container">
  <div ref="removableRow" class="demo-row">
    <orio-tag v-for="tag in removableTags" :key="tag" :text="tag" removable @remove="removeTag(tag)" />
  </div>
</div>

```vue
<template>
<div ref="removableRow" class="demo-row">
  <orio-tag v-for="tag in removableTags" :key="tag" :text="tag" removable @remove="removeTag(tag)" />
</div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
const removableTags = ref(['Vue', 'Nuxt', 'Vite'])
const removableRow = ref(null)
async function removeTag(tag) {
  const index = removableTags.value.indexOf(tag)
  removableTags.value = removableTags.value.filter((item) => item !== tag)
  await nextTick()
  const buttons = removableRow.value.querySelectorAll('button')
  ;(buttons[index] ?? buttons[index - 1])?.focus()
}
</script>
```

## Props

| Prop      | Type                       | Default     | Description      |
| --------- | -------------------------- | ----------- | ---------------- |
| `text`    | `string`                   | -           | Tag text content |
| `variant` | `'neutral' \| 'accent'`    | `'neutral'` | Tag visual style |
| `removable` | `boolean`               | `false`     | Render a remove button |

## Events

| Event    | Payload | Description                         |
| -------- | ------- | ----------------------------------- |
| `remove` | -       | Remove button clicked or activated  |
