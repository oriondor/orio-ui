# Orio UI

Легка та приємна бібліотека компонентів для застосунків на Nuxt 3.

## Можливості

✨ **67 компонентів** — гарні, доступні компоненти, готові до використання
🎨 **Теми** — 6 вбудованих акцентних тем зі світлим і темним режимами
🚀 **Автоімпорт** — безшовно працює з системою автоімпорту Nuxt
📦 **Tree-shaking** — у бандл потрапляє лише те, що ви використовуєте
🎯 **TypeScript** — повна типізація для зручної розробки
🧪 **Протестовано** — 56 наборів тестів для надійності
🌐 **i18n** — вбудована підтримка vue-i18n з англійськими рядками за замовчуванням

## Швидкий старт

```bash
npm install orio-ui
```

Додайте до `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["orio-ui"],
});
```

Починайте використовувати компоненти:

```vue
<template>
  <orio-button variant="primary" @click="handleClick"> Click Me </orio-button>
</template>
```

## Що всередині

### Компоненти

- Елементи форм: Input, NumberInput, NumberInputVertical, NumberInputHorizontal, Textarea, CheckBox, CheckboxGroup, RadioButton, DatePicker, DateRangePicker, Selector, TaggableSelector, SwitchButton
- Навігація: Button, NavButton, Form, Modal, Popover, Tooltip, Banner
- Відображення: Icon, LoadingSpinner, EmptyState, Tag, Badge, ListItem, DashedContainer
- Перегляд: Text, Dates, Separator
- Медіа: Carousel, Upload
- Службові: ControlElement, AnimatedContainer

### Композабли

- `useTheme` — керування темою та колірним режимом
- `useModal` — стан модального вікна з відстеженням точки початку анімації
- `useFuzzySearch` — нечіткий пошук на основі Fuse.js
- `useApi` — типобезпечні API-запити

### Теми

Вбудовані теми: Navy (за замовчуванням), Teal, Forest, Wine, Royal, Violet
Режими: світлий і темний

Усе налаштовується через CSS-змінні.

## Що далі

- [Встановлення та налаштування](/uk/getting-started)
- [Посібник із тем](/uk/theming)
- [Переглянути компоненти](/uk/components/button)
- [Дослідити композабли](/uk/composables/use-theme)
