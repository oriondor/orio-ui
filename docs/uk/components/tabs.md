# Tabs

Рядок кнопок з одиничним вибором. Один компонент, два вигляди (`variant`) і дві семантики (`role`).

## Живе демо

<script setup>
import { ref } from 'vue'

const tab = ref('overview')
const tabOptions = [
  { value: 'overview', label: 'Огляд', icon: 'edit' },
  { value: 'activity', label: 'Активність' },
  { value: 'settings', label: 'Налаштування' },
]

const period = ref('month')
const periodOptions = [
  { value: 'week', label: 'Тиждень' },
  { value: 'month', label: 'Місяць' },
  { value: 'year', label: 'Рік' },
]

const longLabel = ref('a')
const longOptions = [
  { value: 'a', label: 'Дуже довгий підпис, який точно не вміститься в доріжку' },
  { value: 'b', label: 'Короткий' },
]

const size = ref('month')
const disabledOption = ref('week')
const disabledOptions = [
  { value: 'week', label: 'Тиждень' },
  { value: 'month', label: 'Місяць', disabled: true },
  { value: 'year', label: 'Рік' },
]

const slotChoice = ref('month')
const level = ref(2)
const levelOptions = [
  { value: 0, label: 'Вимк.' },
  { value: 1, label: 'Низький' },
  { value: 2, label: 'Високий' },
]
</script>

### Підкреслення з панелями

`role="tablist"` (за замовчуванням), коли рядок перемикає вміст. Передайте `id-prefix`,
щоб кожна вкладка отримала `{prefix}-tab-{value}` і `aria-controls="{prefix}-panel-{value}"`;
надайте панелям відповідні id.

<div class="demo-container">
  <orio-tabs v-model="tab" :options="tabOptions" label="Розділи проєкту" id-prefix="demo" />
  <div
    v-for="option in tabOptions"
    v-show="tab === option.value"
    :id="`demo-panel-${option.value}`"
    :key="option.value"
    role="tabpanel"
    :aria-labelledby="`demo-tab-${option.value}`"
    tabindex="0"
  >
    Панель: {{ option.label }}
  </div>
</div>

### Сегментований вибір значення

`role="radiogroup"`, коли рядок обирає значення і не перемикає панелі.

<div class="demo-container">
  <orio-tabs v-model="period" :options="periodOptions" variant="segmented" role="radiogroup" label="Період" />
  <div class="demo-output">Період: {{ period }}</div>
</div>

### Блок і довгі підписи

`block` розтягує рядок на всю ширину з елементами однакової ширини. Довгі підписи
обрізаються трикрапкою всередині елемента.

<div class="demo-container">
  <orio-tabs v-model="tab" :options="tabOptions" block label="Блок: підкреслення" />
  <orio-tabs v-model="period" :options="periodOptions" variant="segmented" role="radiogroup" block label="Блок: сегментований" />
  <orio-tabs v-model="longLabel" :options="longOptions" variant="segmented" role="radiogroup" label="Довгі підписи" style="max-width: 16rem" />
</div>

### Розміри

<div class="demo-container">
  <orio-tabs v-model="size" :options="periodOptions" variant="segmented" role="radiogroup" size="xs" label="xs" />
  <orio-tabs v-model="size" :options="periodOptions" variant="segmented" role="radiogroup" size="sm" label="sm" />
  <orio-tabs v-model="size" :options="periodOptions" variant="segmented" role="radiogroup" size="md" label="md" />
  <orio-tabs v-model="size" :options="periodOptions" variant="segmented" role="radiogroup" size="lg" label="lg" />
</div>

### Вимкнений стан

Вимкнений варіант пропускається стрілками і не може бути обраний. Проп
`disabled` вимикає весь рядок.

<div class="demo-container">
  <orio-tabs v-model="disabledOption" :options="disabledOptions" label="Вимкнений варіант" />
  <orio-tabs v-model="disabledOption" :options="disabledOptions" disabled label="Увесь рядок вимкнено" />
</div>

### Слот option

<div class="demo-container">
  <orio-tabs v-model="slotChoice" :options="periodOptions" variant="segmented" role="radiogroup" label="Свій варіант">
    <template #option="{ option, selected }">
      {{ selected ? '●' : '○' }} {{ option.label }}
    </template>
  </orio-tabs>
</div>

### Числові значення

`0` є коректним вибором.

<div class="demo-container">
  <orio-tabs v-model="level" :options="levelOptions" variant="segmented" role="radiogroup" label="Рівень" />
  <div class="demo-output">Рівень: {{ level }}</div>
</div>

## Використання

```vue
<template>
  <orio-tabs v-model="tab" :options="tabOptions" label="Розділи проєкту" id-prefix="demo" />
  <div
    v-for="option in tabOptions"
    v-show="tab === option.value"
    :id="`demo-panel-${option.value}`"
    :key="option.value"
    role="tabpanel"
    :aria-labelledby="`demo-tab-${option.value}`"
    tabindex="0"
  >
    Панель: {{ option.label }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('overview')
const tabOptions = [
  { value: 'overview', label: 'Огляд', icon: 'edit' },
  { value: 'activity', label: 'Активність' },
  { value: 'settings', label: 'Налаштування' },
]
</script>
```

## Вибір `role` і `variant`

- `variant` (`underline` | `segmented`) лише вигляд; `role` (`tablist` | `radiogroup`) лише семантика. Допустима будь-яка комбінація.
- `tablist` лише тоді, коли рядок перемикає видимі панелі. Панелі (`role="tabpanel"`) рендерить споживач.
- `radiogroup` для вибору значення (період, фільтр, режим), коли нічого не підміняється.
- `id-prefix` діє лише для `tablist` і має бути **унікальним на сторінці**; два екземпляри з однаковим префіксом дають дубльовані id.

## Властивості

| Проп | Тип | За замовчуванням | Опис |
|------|------|---------|-------------|
| `modelValue` | `string \| number` | `undefined` | Обране значення (v-model) |
| `options` | `{ value, label, icon?, disabled? }[]` | required | Елементи; якщо значення повторюються, **перемагає перший збіг** |
| `variant` | `'underline' \| 'segmented'` | `'underline'` | Вигляд |
| `role` | `'tablist' \| 'radiogroup'` | `'tablist'` | Семантика |
| `label` | `string` | - | Доступна назва (`aria-label`); для видимого підпису використовуйте `aria-labelledby` |
| `idPrefix` | `string` | - | Задає `{prefix}-tab-{value}` / `{prefix}-panel-{value}` (лише tablist) |
| `block` | `boolean` | `false` | Повна ширина, елементи однакової ширини |
| `disabled` | `boolean` | `false` | Вимикає весь рядок |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | успадковується | Розмір контролу |

## Події

| Подія | Дані | Опис |
|-------|---------|-------------|
| `update:modelValue` | `string \| number` | Спрацьовує лише коли вибір змінюється |

## Слоти

| Слот | Пропси | Опис |
|------|-------|-------------|
| `option` | `{ option, selected }` | Замінює вміст елемента (за замовчуванням: необов'язкова іконка + підпис) |

## Клавіатура

- **Tab** - фокус на обраному елементі (або на першому доступному, якщо нічого не обрано)
- **ArrowRight / ArrowLeft** - перейти й обрати наступний / попередній доступний елемент по колу; інвертуються при `dir="rtl"`
- **Home / End** - перший / останній доступний елемент
- Вибір іде за фокусом; вимкнені варіанти пропускаються.

## Стилізація

Перевизначайте на самому елементі або на предку:

| CSS-змінна | За замовчуванням | Опис |
|-----------------|---------|-------------|
| `--orio-tabs-gap` | `var(--control-gap)` | Відступ між елементами |
| `--orio-tabs-radius` | `var(--control-radius)` (пілюля для segmented) | Радіус елемента й доріжки |
| `--orio-tabs-track-bg` | `var(--color-surface)` | Фон доріжки segmented |
| `--orio-tabs-active-bg` | `var(--color-accent)` | Фон активної пілюлі segmented |
| `--orio-tabs-active-ink` | `var(--color-accent-ink)` | Текст активної пілюлі segmented |
