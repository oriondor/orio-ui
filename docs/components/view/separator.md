# View Separator

A horizontal line separator for dividing content sections.

## Live Demo

<div class="demo-container">
  <p>Content above</p>
  <orio-view-separator />
  <p>Content below</p>
</div>

## Usage

### Basic

```vue
<template>
  <orio-view-separator />
</template>
```

### Styles

```vue
<template>
  <orio-view-separator style="solid" />
  <orio-view-separator style="dashed" />
  <orio-view-separator style="dotted" />
  <orio-view-separator style="double" />
</template>
```

### Custom Size and Margin

```vue
<template>
  <!-- Thicker line -->
  <orio-view-separator :size="2" />

  <!-- More spacing -->
  <orio-view-separator :margin="2" />

  <!-- Combined -->
  <orio-view-separator :size="3" :margin="2" style="dashed" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `'solid' \| 'dashed' \| 'dotted' \| 'double' \| 'groove' \| 'ridge'` | `'solid'` | Border style |
| `size` | `number \| string` | `1` | Border thickness in pixels |
| `margin` | `number \| string` | `1` | Vertical margin in rem |

## Styling

Uses the CSS variable:

```css
--color-border
```
