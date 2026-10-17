# View Text

Типографічний компонент для показу тексту з узгодженою стилізацією.

## Базове використання

```vue
<template>
  <orio-view-text>Default text</orio-view-text>
</template>
```

## Типи тексту

Доступні чотири типи тексту:

```vue
<template>
  <orio-view-text type="text">Regular text</orio-view-text>
  <orio-view-text type="title">Heading title</orio-view-text>
  <orio-view-text type="subtitle">Supporting subtitle</orio-view-text>
  <orio-view-text type="italics">Italicized text</orio-view-text>
</template>
```

## Розміри

```vue
<template>
  <orio-view-text size="small">Small</orio-view-text>
  <orio-view-text size="medium">Medium (default)</orio-view-text>
  <orio-view-text size="large">Large</orio-view-text>
  <orio-view-text size="extra-large">Extra Large</orio-view-text>
</template>
```

## З іконками

```vue
<template>
  <orio-view-text icon="check" type="title">
    Completed Task
  </orio-view-text>
</template>
```

## Перетворення тексту

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

## Підтримка v-model

Можна використовувати для показу значення поля:

```vue
<template>
  <orio-view-text v-model="displayValue" type="title" />
</template>

<script setup>
const displayValue = ref('Dynamic content')
</script>
```

## Пропси

| Проп | Тип | За замовчуванням | Опис |
|------|------|---------|-------------|
| `type` | `'text' \| 'title' \| 'subtitle' \| 'italics'` | `'text'` | Варіант стилю тексту |
| `size` | `'small' \| 'medium' \| 'large' \| 'extra-large'` | `'medium'` | Розмір тексту |
| `icon` | `string \| null` | `null` | Назва іконки перед текстом |
| `uppercase` | `boolean` | `false` | Перетворити текст на великі літери |
| `lineClamp` | `number \| string` | `undefined` | Максимум рядків до обрізання |
| `modelValue` | `string` | `undefined` | Текстовий вміст (для v-model) |

## Слоти

| Слот | Опис |
|------|-------------|
| `default` | Текстовий вміст (перекриває modelValue) |

## Стилізація

```css
--color-text-primary
--color-text-secondary
--color-text-tertiary
```

## Приклади

### Заголовок сторінки

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

### Список з іконками

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

### Обрізаний опис

```vue
<template>
  <orio-view-text type="subtitle" line-clamp="3">
    {{ longDescription }}
  </orio-view-text>
</template>
```
