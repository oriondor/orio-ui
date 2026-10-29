# Segmented input

Поле для коду фіксованої довжини, розбите на окремі сегменти — по одному фокусованому
полю на сегмент. Під час введення фокус автоматично переходить на наступний сегмент,
Backspace у порожньому сегменті повертає назад. Ідеально для OTP / кодів підтвердження та PIN-кодів.

## Живе демо

<script setup>
import { ref } from 'vue'

const otp = ref('')
const pairs = ref('')
const word = ref('')
const boundary = ref('')
const lastBoundary = ref('none')
</script>

### Базове (OTP)

<div class="demo-container">
  <orio-segmented-input v-model="otp" />
  <div>Значення: {{ otp || '—' }}</div>
</div>

### Власні кількість і розмір сегментів

Два символи на сегмент, чотири сегменти:

<div class="demo-container">
  <orio-segmented-input v-model="pairs" :segments="4" :segment-size="2" />
  <div>Значення: {{ pairs || '—' }}</div>
</div>

### Текстові сегменти

`type="string"` приймає будь-які символи:

<div class="demo-container">
  <orio-segmented-input v-model="word" type="string" :segments="5" />
  <div>Значення: {{ word || '—' }}</div>
</div>

### Крайові події

`start` спрацьовує, коли Backspace у порожньому сегменті переводить фокус на
перший сегмент (або лишає його там), `end` — коли останній
символ уже в моделі:

<div class="demo-container">
  <orio-segmented-input
    v-model="boundary"
    :segments="4"
    @start="lastBoundary = 'start'"
    @end="lastBoundary = 'end'"
  />
  <div>Остання крайова подія: {{ lastBoundary }}</div>
</div>

## Використання

### Базове

```vue
<template>
  <orio-segmented-input v-model="code" />
</template>

<script setup>
const code = ref("");
</script>
```

### Власні кількість і розмір сегментів

```vue
<orio-segmented-input v-model="licenseKey" :segments="4" :segment-size="2" />
```

### Текстові сегменти

```vue
<orio-segmented-input v-model="word" type="string" :segments="5" />
```

### Крайові події

```vue
<orio-segmented-input
  v-model="code"
  @start="focusPreviousField()"
  @end="submitCode()"
/>
```

## Пропси

| Проп          | Тип                    | За замовчуванням | Опис                                                 |
| ------------- | ---------------------- | ---------------- | ---------------------------------------------------- |
| `modelValue`  | `string \| number`     | `""`             | Об'єднане значення всіх сегментів (v-model)          |
| `segments`    | `number \| string`     | `6`              | Кількість сегментів                                  |
| `segmentSize` | `number \| string`     | `1`              | Символів на сегмент                                  |
| `type`        | `"number" \| "string"` | `"number"`       | `"number"` відхиляє нецифрові клавіші під час введення |
| `segmentLabel` | `(index, total) => string` | перекладене `Цифра 1 з 6` | Доступна назва кожного поля (`index` з 1) |

## Події

| Подія               | Дані     | Опис                                                         |
| ------------------- | -------- | ------------------------------------------------------------ |
| `update:modelValue` | `string` | Генерується з об'єднаним значенням сегментів після кожної зміни |
| `start`             | —        | Backspace у порожньому сегменті приводить до першого сегмента |
| `end`               | —        | Усі сегменти заповнено (введенням, вставленням чи автозаповненням) |

## Відкриті методи

| Метод           | Опис                                                         |
| --------------- | ------------------------------------------------------------ |
| `focus(index?)` | Фокусує сегмент; за замовчуванням перший незаповнений        |

## Особливості поведінки

- Модель — це просте об'єднання всіх сегментів: поле з 6 сегментів
  і `segmentSize: 1` після заповнення дає рядок із 6 символів.
- Вставлення в будь-який сегмент записує весь вставлений текст у модель
  одразу. З `type="number"` спершу відкидаються нецифрові символи; результат
  обрізається до загальної місткості (`segments × segmentSize`). Вставлення,
  що заповнює всі сегменти, також генерує `end`.
- З `type="number"` кожен сегмент рендериться з `inputmode="numeric"`, тож
  мобільні пристрої показують цифрову клавіатуру.
- Перший сегмент має `autocomplete="one-time-code"`, завдяки чому браузери з
  підтримкою пропонують автозаповнення коду з SMS. Він не має `maxlength`,
  тож автозаповнений код розкладається по всіх сегментах.
- Обгортка має `role="group"`; передайте `aria-label`, щоб назвати весь код
  (наприклад, «Код підтвердження»).

## Стилізація

Сегменти — це звичайні поля `<orio-input>`, тож вони успадковують його токени:

```css
--color-bg           /* Segment background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
--color-accent-soft  /* Focus ring color */
```
