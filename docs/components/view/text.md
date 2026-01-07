# View Text

Typography component for displaying text content with consistent styling.

## Basic Usage

```vue
<template>
  <orio-view-text>Default text</orio-view-text>
</template>
```

## Text Types

Four text types available:

```vue
<template>
  <orio-view-text type="text">Regular text</orio-view-text>
  <orio-view-text type="title">Heading title</orio-view-text>
  <orio-view-text type="subtitle">Supporting subtitle</orio-view-text>
  <orio-view-text type="italics">Italicized text</orio-view-text>
</template>
```

## Sizes

```vue
<template>
  <orio-view-text size="small">Small</orio-view-text>
  <orio-view-text size="medium">Medium (default)</orio-view-text>
  <orio-view-text size="large">Large</orio-view-text>
  <orio-view-text size="extra-large">Extra Large</orio-view-text>
</template>
```

## With Icons

```vue
<template>
  <orio-view-text icon="check" type="title">
    Completed Task
  </orio-view-text>
</template>
```

## Text Transformations

```vue
<template>
  <!-- Uppercase -->
  <orio-view-text uppercase>Uppercase text</orio-view-text>

  <!-- Line clamping (ellipsis after N lines) -->
  <orio-view-text line-clamp="2">
    Long text that will be truncated after 2 lines with an ellipsis...
  </orio-view-text>
</template>
```

## v-model Support

Can be used as input display:

```vue
<template>
  <orio-view-text v-model="displayValue" type="title" />
</template>

<script setup>
const displayValue = ref('Dynamic content')
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'text' \| 'title' \| 'subtitle' \| 'italics'` | `'text'` | Text style variant |
| `size` | `'small' \| 'medium' \| 'large' \| 'extra-large'` | `'medium'` | Text size |
| `icon` | `string \| null` | `null` | Icon name to display before text |
| `uppercase` | `boolean` | `false` | Transform text to uppercase |
| `lineClamp` | `number \| string` | `undefined` | Max lines before truncation |
| `modelValue` | `string` | `undefined` | Text content (for v-model) |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Text content (overrides modelValue) |

## Styling

```css
--color-text-primary
--color-text-secondary
--color-text-tertiary
```

## Examples

### Page Header

```vue
<template>
  <div>
    <orio-view-text type="title" size="extra-large">
      Dashboard
    </orio-view-text>
    <orio-view-text type="subtitle">
      Welcome back, here's your overview
    </orio-view-text>
  </div>
</template>
```

### List with Icons

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <orio-view-text :icon="item.completed ? 'check' : 'close'">
        {{ item.name }}
      </orio-view-text>
    </li>
  </ul>
</template>
```

### Truncated Description

```vue
<template>
  <orio-view-text type="subtitle" line-clamp="3">
    {{ longDescription }}
  </orio-view-text>
</template>
```
