# ControlElement

По суті, це обгортка, що прибирає рамку, тінь і відступи з внутрішнього елемента й додає йому підпис.

Вона дає внутрішньому елементу свободу бути чим завгодно.

## Живе демо

<script setup>
import { ref } from 'vue'

const inputValue = ref('')
const textareaValue = ref('')
const numberValue = ref(0)
const selectorValue = ref(null)
const checkboxValue = ref(false)
const switchValue = ref(false)
const innerInputValue = ref('')
const innerTextareaValue = ref('')

const options = ['Apple', 'Banana', 'Cherry', 'Date']
</script>

<div class="demo-container">
  <orio-control-element label="Тут можна додати підпис">
    <input type="text" placeholder="Зверніть увагу: стандартної стилізації тут немає" style="width: stretch" />
  </orio-control-element>
</div>

## Розміри

Проп `size` керує розміром шрифту, внутрішніми відступами, заокругленням і розмірами елементів у всіх обгорнутих компонентах. Доступні розміри: `sm`, `md` (за замовчуванням), `lg`, `xl`.

### Input

<div class="demo-container">
  <orio-input v-model="inputValue" label="Малий" placeholder="sm input" size="sm" />
  <orio-input v-model="inputValue" label="Середній (за замовчуванням)" placeholder="md input" size="md" />
  <orio-input v-model="inputValue" label="Великий" placeholder="lg input" size="lg" />
  <orio-input v-model="inputValue" label="Дуже великий" placeholder="xl input" size="xl" />
</div>

### Input з іконками

<div class="demo-container">
  <orio-input v-model="inputValue" placeholder="sm" size="sm">
    <template #before><orio-icon name="search" /></template>
  </orio-input>
  <orio-input v-model="inputValue" placeholder="md" size="md">
    <template #before><orio-icon name="search" /></template>
  </orio-input>
  <orio-input v-model="inputValue" placeholder="lg" size="lg">
    <template #before><orio-icon name="search" /></template>
  </orio-input>
  <orio-input v-model="inputValue" placeholder="xl" size="xl">
    <template #before><orio-icon name="search" /></template>
  </orio-input>
</div>

### Textarea

<div class="demo-container">
  <div class="demo-grid">
    <orio-textarea v-model="textareaValue" label="Малий" placeholder="sm textarea" size="sm" :rows="2" />
    <orio-textarea v-model="textareaValue" label="Середній" placeholder="md textarea" size="md" :rows="2" />
  </div>
  <div class="demo-grid">
    <orio-textarea v-model="textareaValue" label="Великий" placeholder="lg textarea" size="lg" :rows="2" />
    <orio-textarea v-model="textareaValue" label="Дуже великий" placeholder="xl textarea" size="xl" :rows="2" />
  </div>
</div>

### Button

<div class="demo-container">
  <div class="demo-row">
    <orio-button size="sm">Малий</orio-button>
    <orio-button size="md">Середній</orio-button>
    <orio-button size="lg">Великий</orio-button>
    <orio-button size="xl">Дуже великий</orio-button>
  </div>
  <div class="demo-row">
    <orio-button size="sm" variant="secondary">Малий</orio-button>
    <orio-button size="md" variant="secondary">Середній</orio-button>
    <orio-button size="lg" variant="secondary">Великий</orio-button>
    <orio-button size="xl" variant="secondary">Дуже великий</orio-button>
  </div>
</div>

### Button з іконками

<div class="demo-container">
  <div class="demo-row">
    <orio-button size="sm" icon="plus">Додати</orio-button>
    <orio-button size="md" icon="plus">Додати</orio-button>
    <orio-button size="lg" icon="plus">Додати</orio-button>
    <orio-button size="xl" icon="plus">Додати</orio-button>
  </div>
  <div class="demo-row">
    <orio-button size="sm" icon="settings" />
    <orio-button size="md" icon="settings" />
    <orio-button size="lg" icon="settings" />
    <orio-button size="xl" icon="settings" />
  </div>
</div>

### NavButton

<div class="demo-container">
  <div class="demo-row">
    <orio-nav-button size="sm" icon="home">Головна</orio-nav-button>
    <orio-nav-button size="md" icon="home">Головна</orio-nav-button>
    <orio-nav-button size="lg" icon="home">Головна</orio-nav-button>
    <orio-nav-button size="xl" icon="home">Головна</orio-nav-button>
  </div>
</div>

### SwitchButton

<div class="demo-container">
  <div class="demo-row">
    <orio-switch-button v-model="switchValue" size="sm">Малий</orio-switch-button>
    <orio-switch-button v-model="switchValue" size="md">Середній</orio-switch-button>
    <orio-switch-button v-model="switchValue" size="lg">Великий</orio-switch-button>
    <orio-switch-button v-model="switchValue" size="xl">Дуже великий</orio-switch-button>
  </div>
</div>

### Selector

<div class="demo-container">
  <div class="demo-grid">
    <orio-selector v-model="selectorValue" :options="options" label="Малий" size="sm" />
    <orio-selector v-model="selectorValue" :options="options" label="Середній" size="md" />
    <orio-selector v-model="selectorValue" :options="options" label="Великий" size="lg" />
    <orio-selector v-model="selectorValue" :options="options" label="Дуже великий" size="xl" />
  </div>
</div>

### CheckBox

<div class="demo-container">
  <div class="demo-row">
    <orio-check-box v-model="checkboxValue" size="sm">Малий</orio-check-box>
    <orio-check-box v-model="checkboxValue" size="md">Середній</orio-check-box>
    <orio-check-box v-model="checkboxValue" size="lg">Великий</orio-check-box>
    <orio-check-box v-model="checkboxValue" size="xl">Дуже великий</orio-check-box>
  </div>
</div>

## Внутрішнє розміщення

Input і Textarea підтримують `layout="inner"`, що розміщує підпис усередині меж елемента. Спершу підпис виглядає як заповнювач, а коли поле у фокусі чи заповнене — анімовано зміщується вгору.

### Input

<div class="demo-container">
  <div class="demo-grid">
    <orio-input v-model="innerInputValue" label="Повне ім'я" layout="inner" />
    <orio-input v-model="innerInputValue" type="email" label="Адреса email" layout="inner" />
    <orio-input v-model="innerInputValue" type="password" label="Пароль" layout="inner" />
  </div>
  <div class="demo-grid">
    <orio-input v-model="innerInputValue" label="Пошук" layout="inner" size="sm">
      <template #before><orio-icon name="search" /></template>
    </orio-input>
    <orio-input v-model="innerInputValue" label="Вебсайт" layout="inner" size="lg">
      <template #after><orio-icon name="external-link" /></template>
    </orio-input>
  </div>
</div>

### Textarea

<div class="demo-container">
  <div class="demo-grid">
    <orio-textarea v-model="innerTextareaValue" label="Нотатки" layout="inner" />
    <orio-textarea v-model="innerTextareaValue" label="Відгук" layout="inner" />
  </div>
</div>

### Внутрішнє розміщення з розмірами

<div class="demo-container">
  <div class="demo-grid">
    <orio-input v-model="innerInputValue" label="Малий" layout="inner" size="sm" />
    <orio-input v-model="innerInputValue" label="Середній (за замовчуванням)" layout="inner" size="md" />
    <orio-input v-model="innerInputValue" label="Великий" layout="inner" size="lg" />
    <orio-input v-model="innerInputValue" label="Дуже великий" layout="inner" size="xl" />
  </div>
</div>

## Використання

```vue
<template>
  <orio-control-element label="You can add label here">
    <input
      type="text"
      placeholder="Notice standard styling is not a case here"
      style="width: stretch"
    />
  </orio-control-element>
</template>
```

### Задання розміру

```vue
<!-- Size applies to any component wrapped with ControlElement -->
<orio-input v-model="name" label="Name" size="sm" />
<orio-input v-model="name" label="Name" size="md" />
<orio-input v-model="name" label="Name" size="lg" />
<orio-input v-model="name" label="Name" size="xl" />

<orio-button size="lg">Large Button</orio-button>
<orio-selector v-model="value" :options="options" size="sm" />
```

## Пропси

| Проп         | Тип                                 | За замовчуванням | Опис                                               |
| ------------ | ----------------------------------- | ---------- | -------------------------------------------------------- |
| `appearance` | `'normal' \| 'minimal'`            | `'normal'` | Minimal прибирає відступи, рамку й тінь зі слоту         |
| `size`       | `'sm' \| 'md' \| 'lg' \| 'xl'`    | `'md'`     | Керує розміром шрифту, відступами й заокругленням внутрішніх елементів |
| `layout`     | `'vertical' \| 'horizontal'`       | `'vertical'` | Позиція підпису відносно елемента                      |
| `label`      | `string`                           | -          | Текст підпису над елементом                              |

## Слоти

| Слот      | Опис                 |
| --------- | -------------------- |
| `default` | Елемент форми        |

Слот за замовчуванням надає проп `control` — набір атрибутів, який ваш внутрішній
елемент має розгорнути. Кожен ключ уже записано як DOM-атрибут, яким він
стане, тож достатньо `v-bind`:

```vue
<orio-control-element v-slot="{ control }" label="Email" :error="emailError">
  <input v-bind="control" type="email" />
</orio-control-element>
```

## Доступність

| Ключ набору        | Джерело                                   |
| ------------------ | ----------------------------------------- |
| `id`               | проп `id` або `useId()` — ціль `<label for>` |
| `tabindex`         | проп `tabindex`                           |
| `disabled`         | проп `disabled`                           |
| `required`         | проп `required`                           |
| `name`             | проп `name`                               |
| `focus-key`        | проп `focusKey` — атрибут, який шукає `useRovingGrid` |
| `aria-label`       | проп `ariaLabel` — для елементів без видимого `label` |
| `aria-describedby` | id елемента `.control-error`, коли задано `error` |
| `aria-invalid`     | `"true"`, коли задано `error`            |
| `aria-required`    | проп `required`                           |

Ключі пропускаються, коли сказати нічого, тож порожній `aria-label=""`
не потрапляє в розмітку.

## CSS-змінні

ControlElement встановлює такі CSS custom properties залежно від `size`, а дочірні компоненти їх використовують:

| Змінна                          | sm       | md (за замовч.) | lg       | xl       |
| ------------------------------- | -------- | ------------ | -------- | -------- |
| `--control-font-size`           | 0.75rem  | 0.875rem     | 1.25rem  | 1.75rem  |
| `--control-label-font-size`     | 0.65rem  | 0.75rem      | 0.875rem | 1.25rem  |
| `--control-py`                  | 0.25rem  | 0.5rem       | 0.625rem | 0.75rem  |
| `--control-px`                  | 0.5rem   | 0.75rem      | 1rem     | 1.25rem  |
| `--control-gap`                 | 0.25rem  | 0.5rem       | 0.5rem   | 0.75rem  |
| `--control-radius`              | 4px      | 8px          | 8px      | 12px     |
| `--control-icon-size`           | 0.75rem  | 1rem         | 1.25rem  | 1.5rem   |

## Примітки

- Використовується всередині Input, Textarea, DatePicker тощо
- Забезпечує узгоджені відступи та розміщення
- Можна використовувати для обгортання власних елементів форм
- `label` передається через атрибути й рендериться автоматично
- Розмір каскадується через CSS-змінні — дочірні компоненти зчитують їх автоматично
