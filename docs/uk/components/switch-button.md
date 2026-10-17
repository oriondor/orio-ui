# SwitchButton

Кнопка-перемикач з активним і неактивним станами — ідеальна для фільтрів і перемикання режимів перегляду.

## Живе демо

<script setup>
import { ref } from 'vue'

const isActive = ref(false)
const gridView = ref(false)
const showArchived = ref(false)
const filter1 = ref(true)
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-switch-button v-model="isActive">Перемкни мене</orio-switch-button>
    <orio-switch-button v-model="gridView">Сітка</orio-switch-button>
    <orio-switch-button v-model="showArchived">Показати архів</orio-switch-button>
  </div>
</div>

<div class="demo-output">
  <strong>Стани:</strong><br>
  Перемикач: {{ isActive ? 'Активний' : 'Неактивний' }}<br>
  Вигляд: {{ gridView ? 'Сітка' : 'Список' }}<br>
  Архів: {{ showArchived ? 'Показано' : 'Приховано' }}
</div>

## Стани

<div class="demo-container">
  <div class="demo-row">
    <orio-switch-button v-model="filter1">Активна</orio-switch-button>
    <orio-switch-button :model-value="false">Неактивна</orio-switch-button>
    <orio-switch-button :model-value="true" :disabled="true">Вимкнена активна</orio-switch-button>
    <orio-switch-button :model-value="false" :disabled="true">Вимкнена неактивна</orio-switch-button>
  </div>
</div>

## Використання

### Базове

```vue
<template>
  <orio-switch-button v-model="isEnabled">
    Enable Feature
  </orio-switch-button>
</template>

<script setup>
import { ref } from 'vue'

const isEnabled = ref(false)
</script>
```

### Кнопки-фільтри

```vue
<template>
  <div class="filters">
    <orio-switch-button v-model="showCompleted">
      Completed
    </orio-switch-button>
    <orio-switch-button v-model="showPending">
      Pending
    </orio-switch-button>
    <orio-switch-button v-model="showCancelled">
      Cancelled
    </orio-switch-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showCompleted = ref(true)
const showPending = ref(true)
const showCancelled = ref(false)
</script>
```

### Вимкнений стан

```vue
<orio-switch-button v-model="option" :disabled="true">
  Locked Option
</orio-switch-button>
```

## Пропси

| Проп | Тип | За замовчуванням | Опис |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | Активний стан (v-model) |
| `disabled` | `boolean` | `false` | Вимикає взаємодію з кнопкою |

## Події

| Подія | Дані | Опис |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Генерується під час перемикання кнопки |

## Слоти

| Слот | Опис |
|------|-------------|
| `default` | Текст/вміст підпису кнопки |

## Підтримка клавіатури

- **Space** або **Enter** — перемкнути стан кнопки
- **Tab** — перехід між кнопками-перемикачами

## Доступність

Внутрішня `<button>` має `aria-pressed`, що віддзеркалює `modelValue`, тож скрінрідери
озвучують стан перемикача. Передавайте `aria-pressed` самі лише тоді, коли треба
сказати те, чого не виразити булевим значенням (`aria-pressed="mixed"`); це перекриває
значення за замовчуванням.

Дайте кнопці доступну назву: видимий `label`, текст у слоті за замовчуванням або
`aria-label`, коли в слоті лише іконка.

## Стилізація

Кнопка-перемикач використовує такі CSS-змінні:

```css
--color-surface         /* Inactive background */
--color-muted           /* Inactive text color */
--color-border          /* Default border */
--color-accent          /* Active text and border */
--color-accent-soft     /* Active background */
--border-radius-md      /* Border radius */
```

## Сценарії використання

- **Фільтри**: перемикання видимості окремих категорій вмісту
- **Режими перегляду**: перемикання між макетами (сітка/список, компактний/детальний)
- **Опції**: увімкнення/вимкнення функцій чи налаштувань
- **Множинний вибір**: дозволяє користувачам вибрати кілька незалежних опцій
