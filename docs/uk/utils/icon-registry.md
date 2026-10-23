# Icon Registry

Центральний реєстр усіх вбудованих SVG-іконок, які використовує компонент Icon.

## Огляд

Реєстр іконок містить набір поширених SVG-іконок, що постачаються з Orio UI. Усі іконки зберігаються як вбудовані SVG-рядки — для максимальної швидкодії та гнучкості.

## Доступні іконки

<script setup>
import { iconRegistry } from '../../../src/runtime/utils/icon-registry'
const icons = Object.keys(iconRegistry)
</script>

<div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', padding: '1rem 0' }">
  <div v-for="name in icons" :key="name" :style="{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--vp-c-divider)', textAlign: 'center' }">
    <orio-icon :name="name" size="24" />
    <code :style="{ fontSize: '0.7rem', wordBreak: 'break-all' }">{{ name }}</code>
  </div>
</div>

## Використання

Реєстр іконок використовується всередині компонента `OrioIcon`:

```vue
<template>
  <orio-icon name="edit" />
  <orio-icon name="check" color="green" />
  <orio-icon name="loading-loop" size="32" />
</template>
```

## Доступ до реєстру

Якщо потрібен прямий доступ до реєстру:

```typescript
import { iconRegistry, type IconName } from '0re0-ui/runtime/utils/icon-registry'

// Get an icon SVG string
const editSvg = iconRegistry['edit']

// Get all icon names
const allIcons: IconName[] = Object.keys(iconRegistry)
```

## Структура реєстру

Реєстр — це простий об'єкт «ключ-значення»:

```typescript
export const iconRegistry: Record<string, string> = {
  'loading-loop': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>`,
  'chevron-down': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>`,
  'edit': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">...</svg>`,
  // ... more icons
}

export type IconName = keyof typeof iconRegistry
```

## Підтримка TypeScript

Тип `IconName` дає автодоповнення для всіх доступних іконок:

```typescript
import type { IconName } from '0re0-ui/runtime/utils/icon-registry'

const iconName: IconName = 'edit' // ✓ Valid
const invalid: IconName = 'invalid' // ✗ Type error
```

## Додавання власних іконок

Щоб додати власні іконки у проєкт, розширте реєстр або скористайтеся тим, що компонент Icon приймає будь-яку назву іконки:

### Спосіб 1: розширити реєстр

```typescript
// ~/utils/custom-icons.ts
import { iconRegistry } from '0re0-ui/runtime/utils/icon-registry'

// Add your custom icons
iconRegistry['custom-heart'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>`

iconRegistry['custom-star'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
</svg>`
```

Потім імпортуйте цей файл у застосунку:

```typescript
// app.vue or plugin
import '~/utils/custom-icons'
```

### Спосіб 2: зовнішні бібліотеки іконок

Компонент Icon можна використовувати із зовнішніми бібліотеками іконок, задаючи SVG іконки під час виконання:

```vue
<script setup>
import { iconRegistry } from '0re0-ui/runtime/utils/icon-registry'

// Add icons from icones.js.org or other sources
iconRegistry['mdi-home'] = `<svg>...</svg>`
</script>

<template>
  <orio-icon name="mdi-home" />
</template>
```

## Джерела іконок

Вбудовані іконки взято з:
- [Material Design Icons](https://materialdesignicons.com/)
- [Line MD](https://icon-sets.iconify.design/line-md/)
- [Material Symbols](https://fonts.google.com/icons)

Більше іконок шукайте на [icones.js.org](https://icones.js.org/) — це повноцінний оглядач іконок.

## Примітки щодо швидкодії

- Іконки вбудовані як SVG-рядки — нуль мережевих запитів
- SVG рендеряться безпосередньо в DOM через `v-html`
- Іконки за замовчуванням використовують `currentColor` і успадковують колір тексту
- Жодних файлів іконкових шрифтів для завантаження
- Підтримуються всі сучасні можливості SVG (анімації, градієнти тощо)

## Приклади

### Створення вибору іконки

```vue
<script setup>
import { iconRegistry, type IconName } from '0re0-ui/runtime/utils/icon-registry'

const allIcons = Object.keys(iconRegistry) as IconName[]
const selectedIcon = ref<IconName>('edit')
</script>

<template>
  <div class="icon-picker">
    <orio-button
      v-for="iconName in allIcons"
      :key="iconName"
      variant="secondary"
      :class="{ selected: selectedIcon === iconName }"
      @click="selectedIcon = iconName"
    >
      <orio-icon :name="iconName" size="24" />
      <span>{{ iconName }}</span>
    </orio-button>
  </div>

  <div>
    Selected: <orio-icon :name="selectedIcon" size="48" />
  </div>
</template>

<style scoped>
.icon-picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.icon-picker button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.icon-picker button.selected {
  background: var(--accent-soft);
  border-color: var(--accent-base);
}
</style>
```


## Див. також

- [Компонент Icon](/uk/components/icon)
- [icones.js.org](https://icones.js.org/) — оглядач іконок
