# Selector

Універсальний випадний список з одиночним і множинним вибором та власним рендером опцій.

## Живе демо

<script setup>
import { ref } from 'vue'

// Simple string array
const selectedCountry = ref(null)
const countries = ['Україна', 'Канада', 'Велика Британія', 'Німеччина', 'Франція', 'Японія']

// Multiple selection
const selectedColors = ref([])
const colors = ['Червоний', 'Синій', 'Зелений', 'Жовтий', 'Фіолетовий', 'Помаранчевий']

// Object array with custom fields
const selectedUser = ref(null)
const users = [
  { id: 1, name: 'Іван Петренко', role: 'Адміністратор' },
  { id: 2, name: 'Олена Коваль', role: 'Користувач' },
  { id: 3, name: 'Богдан Шевчук', role: 'Менеджер' },
  { id: 4, name: 'Анна Мельник', role: 'Користувач' }
]
</script>

### Одиночний вибір (рядки)

<div class="demo-container">
  <orio-selector
    v-model="selectedCountry"
    :options="countries"
    placeholder="Оберіть країну"
  />

  <div class="demo-output">
    <strong>Вибрано:</strong> {{ selectedCountry || 'Нічого' }}
  </div>
</div>

### Множинний вибір

<div class="demo-container">
  <orio-selector
    v-model="selectedColors"
    :options="colors"
    placeholder="Оберіть кольори"
    :multiple="true"
  />

  <div class="demo-output">
    <strong>Вибрано:</strong> {{ selectedColors.length > 0 ? selectedColors.join(', ') : 'Нічого' }}
  </div>
</div>

### Масив об'єктів із власними полями

<div class="demo-container">
  <orio-selector
    v-model="selectedUser"
    :options="users"
    field="id"
    option-name="name"
    placeholder="Оберіть користувача"
  />

  <div class="demo-output">
    <strong>Вибраний користувач:</strong>
    <template v-if="selectedUser">
      {{ selectedUser.name }} ({{ selectedUser.role }})
    </template>
    <template v-else>
      Нічого
    </template>
  </div>
</div>

## Використання

### Простий масив рядків

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

### Масив об'єктів

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

### Множинний вибір

```vue
<orio-selector
  v-model="selected"
  :options="options"
  :multiple="true"
/>
```

### Власний рендер опцій

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

## Пропси

| Проп | Тип | За замовчуванням | Опис |
|------|------|---------|-------------|
| `options` | `Array<string \| object>` | - | Масив опцій для вибору |
| `multiple` | `boolean` | `false` | Увімкнути множинний вибір |
| `field` | `string` | `'id'` | Ключове поле для опцій-об'єктів (унікальний ідентифікатор) |
| `optionName` | `string` | `undefined` | Поле для показу в опціях-об'єктах |
| `placeholder` | `string` | `'Select an option'` | Текст-заповнювач |

## Події

| Подія | Дані | Опис |
|-------|---------|-------------|
| `update:modelValue` | `any \| any[]` | Генерується під час зміни вибору |

## Слоти

| Слот | Пропси | Опис |
|------|-------|-------------|
| `trigger` | `{ toggle, control, isOpen, triggerKeydown, selectHighlighted, getOptionKey, getOptionLabel, attrs }` | Власний елемент-тригер |
| `trigger-content` | `{ toggle, getOptionKey, getOptionLabel, attrs }` | Власний вміст тригера |
| `trigger-label` | `{ toggle, getOptionKey, getOptionLabel, attrs }` | Власний текст підпису тригера |
| `option` | `{ option, toggle, selected, getOptionKey, getOptionLabel }` | Власний рендер опції |
| `no-options` | - | Власний порожній стан, коли опцій немає |
| `options-addon` | - | Додатковий вміст унизу випадного списку |

## Атрибути

Атрибути, що не є пропсами (`data-*`, `title`, `aria-describedby`, …), передаються
на кнопку-тригер `<button>`; `class` і `style` також застосовуються до обгортки
`.control`.

```vue
<orio-selector
  v-model="country"
  :options="countries"
  data-testid="country-selector"
  title="Pick a country"
/>
```

Власний `#trigger` замінює цю кнопку, тож прив'яжіть атрибути самостійно:

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

Компонент Selector підтримує дженерики TypeScript:

```typescript
interface User {
  id: number
  name: string
  role: string
}

const selectedUser = ref<User | null>(null)
```

## Стилізація

```css
--color-bg           /* Dropdown background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Selected item background */
--color-surface      /* Hover background */
```
