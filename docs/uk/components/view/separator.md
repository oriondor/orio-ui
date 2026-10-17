# View Separator

Горизонтальна лінія-роздільник для розмежування розділів вмісту.

## Живе демо

<div class="demo-container">
  <p>Вміст вище</p>
  <orio-view-separator />
  <p>Вміст нижче</p>
</div>

## Використання

### Базове

```vue
<template>
  <orio-view-separator />
</template>
```

### Стилі

```vue
<template>
  <orio-view-separator style="solid" />
  <orio-view-separator style="dashed" />
  <orio-view-separator style="dotted" />
  <orio-view-separator style="double" />
</template>
```

### Власні товщина та відступ

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

## Пропси

| Проп | Тип | За замовчуванням | Опис |
|------|------|---------|-------------|
| `style` | `'solid' \| 'dashed' \| 'dotted' \| 'double' \| 'groove' \| 'ridge'` | `'solid'` | Стиль лінії |
| `size` | `number \| string` | `1` | Товщина лінії в пікселях |
| `margin` | `number \| string` | `1` | Вертикальний відступ у rem |

## Стилізація

Використовує CSS-змінну:

```css
--color-border
```
