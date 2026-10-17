# Taggable Selector

Випадний список із пошуком і множинним вибором, що показує вибрані опції тегами всередині тригера й може генерувати подію `create`, коли користувач вводить значення, якого немає в списку. Побудований на основі [Selector](/uk/components/selector) і [Tag](/uk/components/tag).

## Живе демо

<script setup>
import { ref } from 'vue'

const selectedUsers = ref([])
const users = [
  { id: 1, text: 'Іван Петренко', variant: 'accent' },
  { id: 2, text: 'Олена Коваль', variant: 'accent' },
  { id: 3, text: 'Богдан Шевчук', variant: 'neutral' },
  { id: 4, text: 'Анна Мельник', variant: 'accent' }
]

// Creatable demo
const frameworks = ref([
  { id: 'vue', text: 'Vue', variant: 'accent' },
  { id: 'react', text: 'React', variant: 'neutral' },
  { id: 'svelte', text: 'Svelte', variant: 'neutral' }
])
const selectedFrameworks = ref([])
const frameworkSearch = ref('')

function createFramework(text) {
  const option = { id: text.toLowerCase(), text, variant: 'accent' }
  frameworks.value.push(option)
  selectedFrameworks.value.push(option)
}
</script>

### Базове

<div class="demo-container">
  <orio-taggable-selector
    v-model="selectedUsers"
    :options="users"
    :allow-create="false"
    placeholder="Оберіть користувачів"
  />

  <div class="demo-output">
    <strong>Вибрано:</strong> {{ selectedUsers.length > 0 ? selectedUsers.map(u => u.text).join(', ') : 'Нічого' }}
  </div>
</div>

### Зі створенням

Введіть значення, якого немає в списку, а тоді натисніть кнопку **Створити «…»** або <kbd>Enter</kbd>, коли нічого не збігається. Обробник `@create` вирішує, що робити з новим значенням.

<div class="demo-container">
  <orio-taggable-selector
    v-model="selectedFrameworks"
    v-model:search="frameworkSearch"
    :options="frameworks"
    label="Фреймворки"
    placeholder="Знайдіть або створіть фреймворк"
    @create="createFramework"
  />

  <div class="demo-output">
    <strong>Вибрано:</strong> {{ selectedFrameworks.length > 0 ? selectedFrameworks.map(f => f.text).join(', ') : 'Нічого' }}
  </div>
</div>

## Використання

### Базове (лише вибір)

Передайте `:allow-create="false"`, коли список фіксований і користувачі не мають додавати нові опції.

```vue
<script setup>
const selected = ref([]);
const options = [
  { id: 1, text: "Option A", variant: "accent" },
  { id: 2, text: "Option B", variant: "neutral" },
];
</script>

<template>
  <orio-taggable-selector
    v-model="selected"
    :options="options"
    :allow-create="false"
    placeholder="Select options"
  />
</template>
```

### Зі створенням і власним ключем підпису

`field` і `option-name` дозволяють використовувати опції будь-якої форми — за замовчуванням це `"id"` і `"text"`.

```vue
<script setup>
const allSkills = ref([
  { id: "vue", name: "Vue" },
  { id: "nuxt", name: "Nuxt" },
]);
const selected = ref([]);
const search = ref("");

function createSkill(name) {
  const skill = { id: name.toLowerCase(), name };
  allSkills.value.push(skill);
  selected.value.push(skill);
}
</script>

<template>
  <orio-taggable-selector
    v-model="selected"
    v-model:search="search"
    :options="allSkills"
    field="id"
    option-name="name"
    label="Skills"
    @create="createSkill"
  />
</template>
```

## Як це працює

TaggableSelector обгортає [Selector](/uk/components/selector) з примусово увімкненим `multiple`. Тригер рендерить кожну вибрану опцію як `<orio-tag>` плюс пошукове поле `<input>`. Під час введення список опцій нечітко фільтрується (через `useFuzzySearch` за ключем `optionName`). Вибір опції позначає її у випадному списку й додає чип у тригер.

**Створення** увімкнене за замовчуванням. Коли `allow-create` дорівнює `true` (за замовчуванням), а текст пошуку непорожній і не збігається точно з наявною опцією, унизу випадного списку з'являється закріплена кнопка **«Створити …»**. Компонент генерує `@create(searchText)`, коли:

- натиснуто кнопку **Створити**, або
- користувач натискає <kbd>Enter</kbd>, **коли жодна опція не збігається** з пошуком.

Якщо збіги видно, <kbd>Enter</kbd> вибирає підсвічену опцію замість створення. Коли пошук нічого не знаходить, над кнопкою «Створити» показується порожній стан **«Збігів не знайдено»**. Після створення пошукове поле очищається.

`@create` не змінює `options` чи вибір — збереженням володіє батьківський компонент. Додайте нову опцію у свій список (і у `v-model`, якщо її треба вибрати) в обробнику, як у прикладах вище.

## Клавіатура

Випадний список використовує навігацію по списку з [Selector](/uk/components/selector), тож ним можна керувати з клавіатури так само, як звичайним множинним вибором:

- <kbd>↓</kbd> / <kbd>↑</kbd> — переміщення підсвічування (відкриття списку задає початкове підсвічування, тож перше натискання має точку відліку).
- <kbd>Enter</kbd> — вибрати підсвічену опцію; або, коли нічого не збігається, створити (див. вище).
- <kbd>Esc</kbd> — закрити випадний список.

Клавіші введення залишаються за пошуковим полем — поки воно у фокусі, списком керують лише стрілки та <kbd>Esc</kbd>.

## Пропси

Успадковує всі пропси [Selector](/uk/components/selector), крім `multiple` (завжди `true`).

| Проп          | Тип                      | За замовчуванням   | Опис                                                                   |
| ------------- | ------------------------ | ------------------ | ---------------------------------------------------------------------- |
| `options`     | `SelectableOption[]`     | —                  | Опції для вибору (рядки або об'єкти).                                  |
| `field`       | `string`                 | `'id'`             | Ключ, що слугує унікальним ідентифікатором в опціях-об'єктах.          |
| `optionName`  | `string`                 | `'text'`           | Ключ для видимого підпису й нечіткого пошуку в опціях-об'єктах.        |
| `placeholder` | `string`                 | значення i18n      | Заповнювач у пошуковому полі, коли нічого не вибрано.                  |
| `tagVariant`  | `'neutral' \| 'accent'`  | —                  | Варіант, що застосовується до **кожного** чипа (варіанта для окремої опції немає). |
| `allowCreate` | `boolean`                | `true`             | Показувати кнопку «Створити …» і дозволяти створення через Enter. `false` вимикає це. |
| `label`       | `string`                 | —                  | Текст підпису (передається в ControlElement).                          |
| `size`        | `'xs'…'xl'`              | успадкований       | Розмір елемента (передається в ControlElement).                        |

## Моделі

| Модель         | Тип                  | За замовчуванням | Опис                                                   |
| -------------- | -------------------- | ---------------- | ------------------------------------------------------ |
| `v-model`      | `SelectableOption[]` | `[]`             | Двобічне зв'язування масиву вибраних опцій.            |
| `v-model:search` | `string`           | `''`             | Двобічне зв'язування пошукового поля. Очищається після створення. |

## Події

| Подія    | Дані     | Опис                                                                                         |
| -------- | -------- | -------------------------------------------------------------------------------------------- |
| `create` | `string` | Користувач попросив створити нову опцію (кнопка «Створити» або Enter без збігів). Текст пошуку. |

## i18n

| Ключ                        | Англійською        |
| --------------------------- | ------------------ |
| `taggableSelector.placeholder` | `Select options`   |
| `taggableSelector.create`   | `Create "{search}"` |
| `taggableSelector.noMatches` | `No matches found` |

## Стилізація

Вибрані теги переносяться всередині тригера завдяки `flex-wrap`:

```css
--color-accent-soft   /* Accent tag background */
--color-accent-border /* Accent tag border */
--color-surface       /* Neutral tag background */
--color-border        /* Neutral tag border */
```
