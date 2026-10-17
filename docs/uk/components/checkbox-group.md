# CheckboxGroup

Група чекбоксів зі спільною легендою, побудована на семантичному елементі `<fieldset>`.

## Живе демо

<script setup>
import { ref, computed } from 'vue'

const permissions = ref(['read'])
const notifications = ref(['email', 'push'])
const days = ref([])
const selected = ref(['vue'])

const permissionOptions = [
  { label: 'Читання', value: 'read' },
  { label: 'Запис', value: 'write' },
  { label: 'Видалення', value: 'delete' },
]

const notificationOptions = [
  { label: 'Email', value: 'email' },
  { label: 'Push-сповіщення', value: 'push' },
  { label: 'SMS', value: 'sms' },
]

const dayOptions = [
  { label: 'Понеділок', value: 'mon' },
  { label: 'Вівторок', value: 'tue' },
  { label: 'Середа', value: 'wed' },
  { label: 'Четвер', value: 'thu' },
  { label: "П'ятниця", value: 'fri' },
]

const daysError = computed(() =>
  days.value.length === 0 ? 'Оберіть принаймні один день.' : null
)
</script>

### Вертикально (за замовчуванням)

<div class="demo-container">
  <div class="demo-grid">
    <orio-checkbox-group
      v-model="permissions"
      label="Дозволи"
      :options="permissionOptions"
    />
    <orio-checkbox-group
      v-model="notifications"
      label="Сповіщати мене через"
      :options="notificationOptions"
    />
  </div>
</div>

<div class="demo-output">
  <strong>Дозволи:</strong> {{ permissions.join(', ') || 'немає' }}<br>
  <strong>Сповіщення:</strong> {{ notifications.join(', ') || 'немає' }}
</div>

### Горизонтально

<div class="demo-container">
  <div class="demo-grid">
    <orio-checkbox-group
      v-model="notifications"
      label="Сповіщати мене через"
      layout="horizontal"
      :options="notificationOptions"
    />
  </div>
</div>

### З помилкою

<div class="demo-container">
  <div class="demo-grid">
    <orio-checkbox-group
      v-model="days"
      label="Робочі дні"
      :options="dayOptions"
      :error="daysError"
    />
  </div>
</div>

### Композиція через слот

Використовуйте слот за замовчуванням, щоб розмістити компоненти `<orio-check-box>` напряму, коли для кожної опції потрібна власна логіка.

<div class="demo-container">
  <div class="demo-grid">
    <orio-checkbox-group v-model="selected" label="Фреймворки">
      <orio-check-box
        appearance="minimal"
        :model-value="selected.includes('vue')"
        @update:model-value="v => v ? selected.push('vue') : selected.splice(selected.indexOf('vue'), 1)"
      >
        Vue
      </orio-check-box>
      <orio-check-box
        appearance="minimal"
        :model-value="selected.includes('react')"
        @update:model-value="v => v ? selected.push('react') : selected.splice(selected.indexOf('react'), 1)"
      >
        React
      </orio-check-box>
      <orio-check-box
        appearance="minimal"
        :model-value="selected.includes('svelte')"
        @update:model-value="v => v ? selected.push('svelte') : selected.splice(selected.indexOf('svelte'), 1)"
      >
        Svelte
      </orio-check-box>
    </orio-checkbox-group>
  </div>
</div>

<div class="demo-output">
  <strong>Вибрано:</strong> {{ selected.join(', ') || 'нічого' }}
</div>

## Використання

### Базове

```vue
<template>
  <orio-checkbox-group
    v-model="selected"
    label="Permissions"
    :options="options"
  />
</template>

<script setup>
import { ref } from "vue";

const selected = ref(["read"]);
const options = [
  { label: "Read", value: "read" },
  { label: "Write", value: "write" },
  { label: "Delete", value: "delete" },
];
</script>
```

### Горизонтальне розміщення

```vue
<orio-checkbox-group
  v-model="selected"
  label="Notify me via"
  layout="horizontal"
  :options="options"
/>
```

### З помилкою

```vue
<orio-checkbox-group
  v-model="selected"
  label="Working days"
  :options="dayOptions"
  :error="selected.length === 0 ? 'Select at least one day.' : null"
/>
```

### Через слот

Використовуйте слот, коли для кожної опції потрібна власна розмітка чи іконки. Передайте `appearance="minimal"` кожному `CheckBox`, щоб прибрати його зовнішній відступ.

```vue
<orio-checkbox-group v-model="selected" label="Frameworks">
  <orio-check-box
    appearance="minimal"
    :model-value="selected.includes('vue')"
    @update:model-value="toggle('vue')"
  >
    Vue
  </orio-check-box>
  <orio-check-box
    appearance="minimal"
    :model-value="selected.includes('react')"
    @update:model-value="toggle('react')"
  >
    React
  </orio-check-box>
</orio-checkbox-group>
```

## Пропси

| Проп         | Тип                            | За замовчуванням | Опис                                                 |
| ------------ | ------------------------------ | ---------------- | ---------------------------------------------------- |
| `modelValue` | `unknown[]`                    | `[]`             | Масив вибраних значень (v-model)                     |
| `options`    | `CheckboxOption[]`             | `[]`             | Список опцій для рендеру (ігнорується, якщо використано слот) |
| `label`      | `string`                       | `undefined`      | Текст легенди групи                                  |
| `layout`     | `"vertical" \| "horizontal"`   | `"vertical"`     | Позиція легенди відносно чекбоксів                   |
| `size`       | `"sm" \| "md" \| "lg" \| "xl"` | `"md"`           | Розмір чекбоксів і підпису                           |
| `error`      | `string \| null`               | `null`           | Повідомлення про помилку під групою                  |

### CheckboxOption

```ts
interface CheckboxOption {
  label: string;
  value: unknown;
}
```

## Події

| Подія               | Дані        | Опис                                       |
| ------------------- | ----------- | ------------------------------------------ |
| `update:modelValue` | `unknown[]` | Генерується під час перемикання будь-якого чекбокса |

## Слоти

| Слот      | Опис                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| `default` | Власний вміст чекбоксів. Перекриває проп `options`. Використовуйте `appearance="minimal"` на кожному `<orio-check-box>`. |

## Доступність

- Рендериться як `<fieldset>` з `<legend>` — скрінрідери озвучують підпис групи перед кожним чекбоксом.
- Кожен `<orio-check-box>` всередині використовує нативний `<input type="checkbox">` з видимим `<label>`, тож фокус, клавіатура й поведінка скрінрідерів повністю нативні.
