# NumberInput

Числові поля з обмеженнями min/max і необов'язковими кнопками кроку. Доступні у трьох варіантах.

## Живе демо

<script setup>
import { ref } from 'vue'

const basic = ref(10)
const vertical = ref(5)
const horizontal = ref(1)
const price = ref(9.99)
const horizontalLayout = ref(3)
const innerBasic = ref(25)
const innerVertical = ref(8)
const innerHorizontal = ref(4)
const money = ref(null)
const nativeNumber = ref(5)
</script>

### Базове (без кнопок)

<div class="demo-container">
  <orio-number-input
    v-model="basic"
    :min="0"
    :max="100"
    label="Кількість"
    placeholder="Введіть кількість"
  />
  <div class="demo-output">Значення: {{ basic }}</div>
</div>

### Вертикальні кнопки

<div class="demo-container">
  <orio-number-input-vertical
    v-model="vertical"
    :min="0"
    :max="100"
    :step="1"
    label="Кількість"
  />
  <div class="demo-output">Значення: {{ vertical }}</div>
</div>

### Порожнє значення та грошове поле

<div class="demo-container">
  <orio-number-input-horizontal
    v-model="money"
    :min="0"
    :step="0.1"
    :decimal-places="2"
    label="Сума"
  />
  <div class="demo-output">Value: {{ money }}</div>
</div>

### Горизонтальні кнопки

<div class="demo-container">
  <orio-number-input-horizontal
    v-model="horizontal"
    :min="0"
    :max="10"
    :step="1"
    label="Товари"
  />
  <div class="demo-output">Значення: {{ horizontal }}</div>
</div>

### Десяткові значення

<div class="demo-container">
  <orio-number-input-horizontal
    v-model="price"
    :min="0"
    :max="1000"
    :step="0.01"
    :decimal-places="2"
    label="Ціна"
  />
  <div class="demo-output">Значення: {{ price }}</div>
</div>

### Рідне числове поле

<div class="demo-container">
  <orio-number-input-horizontal
    v-model="nativeNumber"
    type="number"
    :min="0"
    :max="10"
    label="Рідне"
  />
  <div class="demo-output">Значення: {{ nativeNumber }}</div>
</div>

### Горизонтальне розміщення

<div class="demo-container">
  <orio-number-input-vertical
    v-model="horizontalLayout"
    :min="0"
    :max="10"
    label="Сума"
    layout="horizontal"
  />
</div>

### Внутрішнє розміщення

<div class="demo-container">
  <div class="demo-grid">
    <orio-number-input
      v-model="innerBasic"
      :min="0"
      :max="100"
      label="Кількість"
      layout="inner"
    />
    <orio-number-input-vertical
      v-model="innerVertical"
      :min="0"
      :max="50"
      label="Запас"
      layout="inner"
    />
    <orio-number-input-horizontal
      v-model="innerHorizontal"
      :min="0"
      :max="20"
      label="Лічильник"
      layout="inner"
    />
  </div>
</div>

## Варіанти

| Компонент                      | Опис                                     |
| ------------------------------ | ---------------------------------------- |
| `orio-number-input`            | Базове числове поле без кнопок           |
| `orio-number-input-vertical`   | Кнопки розташовані вертикально праворуч  |
| `orio-number-input-horizontal` | Кнопки «мінус»/«плюс» ліворуч і праворуч |

## Використання

### Базове

```vue
<template>
  <orio-number-input v-model="value" :min="0" :max="100" />
</template>

<script setup>
const value = ref(0);
</script>
```

### Вертикальні кнопки

```vue
<orio-number-input-vertical
  v-model="quantity"
  :min="1"
  :max="99"
  :step="1"
  label="Quantity"
/>
```

### Горизонтальні кнопки

```vue
<orio-number-input-horizontal
  v-model="count"
  :min="0"
  :max="10"
  :step="1"
  label="Count"
/>
```

### Десяткові значення

```vue
<orio-number-input-horizontal
  v-model="price"
  :min="0"
  :max="1000"
  :step="0.01"
  :decimal-places="2"
  label="Price"
/>
```

### Рідне числове поле

```vue
<orio-number-input-horizontal
  v-model="nativeNumber"
  type="number"
  :min="0"
  :max="10"
  label="Рідне"
/>
```

### Горизонтальне розміщення

```vue
<orio-number-input v-model="value" label="Amount" layout="horizontal" />
```

### Внутрішнє розміщення

```vue
<orio-number-input v-model="value" label="Quantity" layout="inner" />
```

## Можливості

- **Перевірка меж** — під час втрати фокусу значення обмежується діапазоном min/max
- **Кнопки збільшення/зменшення** — клік змінює значення на величину кроку (Vertical і Horizontal)
- **Натиснути й утримувати** — утримання кнопки безперервно змінює значення після затримки 500 мс (Vertical і Horizontal)
- **Десяткова точність** — кількість знаків після коми задається пропом `decimalPlaces`; округлення точне (`1.005` з 2 знаками дає `1.01`, кроки `0.1 + 0.2` дають `0.3`). Точність — більше з `decimalPlaces` і кількості знаків `step`
- **Порожнє — це `null`** — очищення поля генерує `null` і ніколи не стає `0`. Кнопки кроку та ArrowUp/ArrowDown починають з `min ?? 0`
- **Текстовий режим враховує локаль** — у фокусі поле показує саме те, що ввів користувач (`1,` лишається `1,`). Коли значення змінюється ззовні (крок, обмеження, округлення, проп), показується десятковий роздільник локалі vue-i18n без групування (`1234,5` для `de`). Коректне введене значення при blur не переписується; нерозпізнаваний текст повертається до останнього значення
- **Розбір у текстовому режимі евристичний** — див. `useDecimalFormatter().toNumber`; `1,234` читається як 1.234 (без крапки остання кома — десятковий роздільник), `1,234.5` — як 1234.5, а юнікодний мінус `−` (`sv`, `fi`, `nb`) приймається
- **Латиниця на екрані, рідні цифри приймаються** — значення, які компонент форматує сам (кроки, обмеження, округлення, зовнішні зміни моделі), показуються латинськими цифрами 0-9 із латинською десятковою позначкою локалі (`ar-EG` і `fa` показують `.`, а не `٫`). Введені рідні цифри будь-якого письма (`۱۲۳`, `١٢٣`, `১২৩`, `१२३`) та арабський десятковий роздільник `٫` зчитуються в значення моделі, а коректний введений текст лишається як введено (`fa`: ввести `۱۲`, Tab — поле показує `۱۲`, модель 12); арабський роздільник тисяч `٬` ігнорується
- **Усе інше нечислове не читається** — у текстовому режимі введення з будь-чим, крім цифр (будь-якого письма), пробілів, `.`, `,`, `٫`, `٬`, `-` або `−` (наприклад `1a5`, `1e5`, `12abc`), нічого не генерує під час набору, а при blur повертається до останнього значення
- **Нативний режим відкидає хибне введення** — з `type="number"` будь-яке хибне нативне введення (зокрема кінцева `.`, як-от `1.` у Chrome) очищується при blur, а значення стає `null`

## Пропси

| Проп            | Тип                                     | За замовчуванням | Опис                                                                                   |
| --------------- | --------------------------------------- | ---------------- | -------------------------------------------------------------------------------------- |
| `modelValue`    | `number \| null`                        | `null`           | Значення поля (v-model); порожнє — `null`                                              |
| `type`          | `"text" \| "number"`                    | `"text"`         | Текстовий режим (`inputmode="decimal"`, `1.5` і `1,5` однаково) або рідне числове поле |
| `layout`        | `"vertical" \| "horizontal" \| "inner"` | `"vertical"`     | Позиція підпису відносно поля                                                          |
| `min`           | `number`                                | `undefined`      | Мінімальне допустиме значення                                                          |
| `max`           | `number`                                | `undefined`      | Максимальне допустиме значення                                                         |
| `step`          | `number`                                | `1`              | Величина зміни за один крок                                                            |
| `decimalPlaces` | `number`                                | `0`              | Знаків, до яких округлюється значення (не менше за знаки `step`)                       |
| `label`         | `string`                                | `undefined`      | Текст підпису                                                                          |
| `placeholder`   | `string`                                | `undefined`      | Текст-заповнювач                                                                       |

Усі стандартні HTML-атрибути input підтримуються через `v-bind="$attrs"`.

## Події

| Подія               | Дані             | Опис                                    |
| ------------------- | ---------------- | --------------------------------------- |
| `update:modelValue` | `number \| null` | Генерується під час зміни значення поля |

## Стилізація

```css
--color-bg           /* Input background */
--color-border       /* Border color */
--color-text         /* Text color */
--color-accent       /* Focus border color */
```
