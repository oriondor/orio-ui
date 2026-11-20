# Selector

Універсальний випадний список з одиночним і множинним вибором та власним рендером опцій.

## Живе демо

<script setup>
import { nextTick, ref } from 'vue'
import { useFuzzySearch } from '../../../src/runtime/composables/useFuzzySearch'

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

const channels = [
  { id: 'mail', name: 'Пошта', icon: 'mail' },
  { id: 'phone', name: 'Телефон', icon: 'phone' },
  { id: 'chat', name: 'Чат', icon: 'chat' },
  { id: 'message', name: 'Повідомлення', icon: 'message' }
]
const optionChannel = ref(null)
const triggerChannel = ref(null)

const tagItems = [
  { id: 1, label: 'Терміново' },
  { id: 2, label: 'Оплата' },
  { id: 3, label: 'Помилка' },
  { id: 4, label: 'Функція' },
  { id: 5, label: 'Документи' }
]
const selectedTags = ref([])
const tagsTrigger = ref(null)
async function removeTag(tag) {
  const index = selectedTags.value.findIndex((item) => item.id === tag.id)
  selectedTags.value = selectedTags.value.filter((item) => item.id !== tag.id)
  await nextTick()
  const buttons = tagsTrigger.value.querySelectorAll('button')
  const next = buttons[index] ?? buttons[index - 1] ?? tagsTrigger.value
  next.focus()
}

const people = [
  { id: 1, name: 'Ада Лавлейс', role: 'Інженерка' },
  { id: 2, name: 'Грейс Гоппер', role: 'Адмірал' },
  { id: 3, name: 'Алан Тюрінг', role: 'Математик' },
  { id: 4, name: 'Кетрін Джонсон', role: 'Аналітикиня' },
  { id: 5, name: 'Лінус Торвальдс', role: 'Мейнтейнер' }
]
const search = ref('')
const matchedPeople = useFuzzySearch(people, search, { keys: ['name'], threshold: 0.3 })
const searchedPerson = ref(null)

const richUser = ref(null)

const emptyTeam = ref(null)
const sizedCountry = ref(null)
const disabledCountry = ref(null)
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

## Слоти в дії

Демо нижче використовують справжні слоти. Кожен фрагмент — розмітка демо.

### Опції з іконками

<div class="demo-container">
<orio-selector v-model="optionChannel" :options="channels" field="id" option-name="name" placeholder="Оберіть канал">
  <template #option="{ option }">
    <orio-view-text :icon="option.icon">{{ option.name }}</orio-view-text>
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Вибрано:</strong> {{ optionChannel?.name || 'Нічого' }}
</div>
</div>

```vue
<orio-selector v-model="optionChannel" :options="channels" field="id" option-name="name" placeholder="Оберіть канал">
  <template #option="{ option }">
    <orio-view-text :icon="option.icon">{{ option.name }}</orio-view-text>
  </template>
</orio-selector>
```

### Тригер з іконкою

<div class="demo-container">
<orio-selector v-model="triggerChannel" :options="channels" field="id" option-name="name" placeholder="Оберіть канал">
  <template #trigger-label="{ getOptionLabel }">
    <orio-view-text :icon="triggerChannel?.icon">{{ getOptionLabel(triggerChannel) }}</orio-view-text>
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Вибрано:</strong> {{ triggerChannel?.name || 'Нічого' }}
</div>
</div>

```vue
<orio-selector v-model="triggerChannel" :options="channels" field="id" option-name="name" placeholder="Оберіть канал">
  <template #trigger-label="{ getOptionLabel }">
    <orio-view-text :icon="triggerChannel?.icon">{{ getOptionLabel(triggerChannel) }}</orio-view-text>
  </template>
</orio-selector>
```

### Множинний вибір з чипами

Типова кнопка не може містити інтерактивні елементи, тому для видалення чипів використано власний `#trigger`. `<orio-tag removable>` рендерить нативну кнопку видалення, що зупиняє власні click та Enter/Space, тож видалення чипа не перемикає список. Тригер бере `aria-controls` зі слот-пропа `listboxId` і враховує `disabled` з об'єкта `control`. Після видалення фокус переходить на кнопку видалення наступного чипа, інакше попереднього, інакше на тригер.

<div class="demo-container">
<orio-selector v-model="selectedTags" :options="tagItems" multiple field="id" option-name="label" placeholder="Оберіть теги" aria-label="Оберіть теги">
  <template #trigger="{ toggle, control, attrs, isOpen, listboxId, triggerKeydown, getOptionKey, getOptionLabel }">
    <div ref="tagsTrigger" v-bind="{ ...attrs, ...control }" class="demo-tags-trigger" role="combobox" :tabindex="control.disabled ? undefined : (control.tabindex ?? 0)" :aria-disabled="control.disabled || undefined" aria-haspopup="listbox" :aria-expanded="isOpen" :aria-controls="listboxId" @click="!control.disabled && toggle()" @keydown="!control.disabled && triggerKeydown($event)">
      <span v-if="!selectedTags.length" class="demo-tags-placeholder">{{ getOptionLabel(undefined) }}</span>
      <orio-tag v-for="tag in selectedTags" :key="getOptionKey(tag)" :text="getOptionLabel(tag)" :removable="!control.disabled" @remove="removeTag(tag)" />
      <orio-icon name="chevron-down" class="demo-tags-chevron" />
    </div>
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Вибрано:</strong> {{ selectedTags.map((tag) => tag.label).join(', ') || 'Нічого' }}
</div>
</div>

```vue
<template>
<orio-selector v-model="selectedTags" :options="tagItems" multiple field="id" option-name="label" placeholder="Оберіть теги" aria-label="Оберіть теги">
  <template #trigger="{ toggle, control, attrs, isOpen, listboxId, triggerKeydown, getOptionKey, getOptionLabel }">
    <div ref="tagsTrigger" v-bind="{ ...attrs, ...control }" class="demo-tags-trigger" role="combobox" :tabindex="control.disabled ? undefined : (control.tabindex ?? 0)" :aria-disabled="control.disabled || undefined" aria-haspopup="listbox" :aria-expanded="isOpen" :aria-controls="listboxId" @click="!control.disabled && toggle()" @keydown="!control.disabled && triggerKeydown($event)">
      <span v-if="!selectedTags.length" class="demo-tags-placeholder">{{ getOptionLabel(undefined) }}</span>
      <orio-tag v-for="tag in selectedTags" :key="getOptionKey(tag)" :text="getOptionLabel(tag)" :removable="!control.disabled" @remove="removeTag(tag)" />
      <orio-icon name="chevron-down" class="demo-tags-chevron" />
    </div>
  </template>
</orio-selector>
</template>

<script setup>
import { nextTick, ref } from 'vue'
const tagItems = [
  { id: 1, label: 'Терміново' },
  { id: 2, label: 'Оплата' },
  { id: 3, label: 'Помилка' },
  { id: 4, label: 'Функція' },
  { id: 5, label: 'Документи' }
]
const selectedTags = ref([])
const tagsTrigger = ref(null)
async function removeTag(tag) {
  const index = selectedTags.value.findIndex((item) => item.id === tag.id)
  selectedTags.value = selectedTags.value.filter((item) => item.id !== tag.id)
  await nextTick()
  const buttons = tagsTrigger.value.querySelectorAll('button')
  const next = buttons[index] ?? buttons[index - 1] ?? tagsTrigger.value
  next.focus()
}
</script>
```

```vue
<style scoped>
.demo-tags-trigger {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.5rem;
  cursor: pointer;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  color: var(--color-text);
}
.demo-tags-trigger:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.demo-tags-trigger[aria-disabled="true"] {
  background-color: var(--color-surface);
  color: var(--color-muted);
  cursor: not-allowed;
}
.demo-tags-placeholder {
  color: var(--color-muted);
}
.demo-tags-chevron {
  margin-left: auto;
  color: var(--color-muted);
}
</style>
```

### З пошуком

Фільтр живе поза Selector: `useFuzzySearch` звужує `:options`, а v-model зберігає обрану людину, навіть коли її відфільтровано.

<div class="demo-container">
<orio-selector v-model="searchedPerson" :options="matchedPeople" field="id" option-name="name" placeholder="Оберіть людину">
  <template #no-options>
    <orio-empty-state title="Нікого не знайдено" description="Спробуйте інший запит." size="small" />
  </template>
  <template #options-addon>
    <orio-input v-model="search" aria-label="Пошук людей" placeholder="Пошук людей" />
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Вибрано:</strong> {{ searchedPerson?.name || 'Нічого' }}
</div>
</div>

```vue
<orio-selector v-model="searchedPerson" :options="matchedPeople" field="id" option-name="name" placeholder="Оберіть людину">
  <template #no-options>
    <orio-empty-state title="Нікого не знайдено" description="Спробуйте інший запит." size="small" />
  </template>
  <template #options-addon>
    <orio-input v-model="search" aria-label="Пошук людей" placeholder="Пошук людей" />
  </template>
</orio-selector>
```

### Розширені рядки опцій

<div class="demo-container">
<orio-selector v-model="richUser" :options="people" field="id" option-name="name" placeholder="Оберіть користувача">
  <template #option="{ option }">
    <div>
      <orio-view-text type="title" size="small">{{ option.name }}</orio-view-text>
      <orio-view-text size="small" style="--view-text-color: var(--color-muted)">{{ option.role }}</orio-view-text>
    </div>
  </template>
</orio-selector>

<div class="demo-output">
  <strong>Вибрано:</strong> {{ richUser?.name || 'Нічого' }}
</div>
</div>

```vue
<orio-selector v-model="richUser" :options="people" field="id" option-name="name" placeholder="Оберіть користувача">
  <template #option="{ option }">
    <div>
      <orio-view-text type="title" size="small">{{ option.name }}</orio-view-text>
      <orio-view-text size="small" style="--view-text-color: var(--color-muted)">{{ option.role }}</orio-view-text>
    </div>
  </template>
</orio-selector>
```

### Власний порожній стан

<div class="demo-container">
<orio-selector v-model="emptyTeam" :options="[]" placeholder="Оберіть команду">
  <template #no-options>
    <orio-empty-state icon="info" title="Команд ще немає" description="Створіть команду, щоб побачити її тут." size="small" />
  </template>
</orio-selector>

</div>

```vue
<orio-selector v-model="emptyTeam" :options="[]" placeholder="Оберіть команду">
  <template #no-options>
    <orio-empty-state icon="info" title="Команд ще немає" description="Створіть команду, щоб побачити її тут." size="small" />
  </template>
</orio-selector>
```

### Розміри

<div class="demo-container">
<orio-selector v-model="sizedCountry" :options="countries" size="xs" placeholder="xs" />
<orio-selector v-model="sizedCountry" :options="countries" size="sm" placeholder="sm" />
<orio-selector v-model="sizedCountry" :options="countries" size="md" placeholder="md" />
<orio-selector v-model="sizedCountry" :options="countries" size="lg" placeholder="lg" />
<orio-selector v-model="sizedCountry" :options="countries" size="xl" placeholder="xl" />
</div>

```vue
<orio-selector v-model="sizedCountry" :options="countries" size="xs" placeholder="xs" />
<orio-selector v-model="sizedCountry" :options="countries" size="sm" placeholder="sm" />
<orio-selector v-model="sizedCountry" :options="countries" size="md" placeholder="md" />
<orio-selector v-model="sizedCountry" :options="countries" size="lg" placeholder="lg" />
<orio-selector v-model="sizedCountry" :options="countries" size="xl" placeholder="xl" />
```

### Вимкнений

Вимкнений селектор не фокусується і не відкривається.

<div class="demo-container">
<orio-selector v-model="disabledCountry" :options="countries" disabled placeholder="Оберіть країну" />

</div>

```vue
<orio-selector v-model="disabledCountry" :options="countries" disabled placeholder="Оберіть країну" />
```

<style scoped>
.demo-tags-trigger {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  min-height: 1.5rem;
  cursor: pointer;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--control-radius);
  padding: var(--control-py) var(--control-px);
  color: var(--color-text);
}
.demo-tags-trigger:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.demo-tags-trigger[aria-disabled="true"] {
  background-color: var(--color-surface);
  color: var(--color-muted);
  cursor: not-allowed;
}
.demo-tags-placeholder {
  color: var(--color-muted);
}
.demo-tags-chevron {
  margin-left: auto;
  color: var(--color-muted);
}
</style>

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
| `trigger` | `{ toggle, control, isOpen, listboxId, triggerKeydown, selectHighlighted, getOptionKey, getOptionLabel, attrs }` | Власний елемент-тригер |
| `trigger-content` | `{ toggle, getOptionKey, getOptionLabel, attrs }` | Власний вміст тригера |
| `trigger-label` | `{ toggle, getOptionKey, getOptionLabel, attrs }` | Власний текст підпису тригера |
| `option` | `{ option, toggle, selected, getOptionKey, getOptionLabel }` | Власний рендер опції |
| `no-options` | - | Власний порожній стан, коли опцій немає |
| `options-addon` | - | Додатковий вміст унизу випадного списку. Tab з відкритого тригера переходить у нього; ArrowUp/ArrowDown та Enter у текстовому полі керують списком; Shift+Tab і Escape повертають до тригера |

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
