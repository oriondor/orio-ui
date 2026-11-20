# NumberInput

Нативне числове поле з обмеженнями min/max і необов'язковими кнопками кроку. Доступні у трьох варіантах. Для грошових сум див. [NumberInputMoney](./number-input-money).

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
const empty = ref(null)
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

### Порожнє значення

<div class="demo-container">
  <orio-number-input-horizontal
    v-model="empty"
    :min="0"
    :step="0.1"
    :decimal-places="2"
    label="Сума"
  />
  <div class="demo-output">Значення: {{ empty }}</div>
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

### Горизонтальне розміщення

```vue
<orio-number-input v-model="value" label="Amount" layout="horizontal" />
```

### Внутрішнє розміщення

```vue
<orio-number-input v-model="value" label="Quantity" layout="inner" />
```

## Можливості

- **Рідне числове поле** — завжди рендерить `<input type="number">`: розбір робить браузер, десятковий роздільник `.`, без обробки тексту за локаллю. Атрибут `type` ігнорується. Для грошових сум використовуйте [`orio-number-input-money`](./number-input-money)
- **Модель, що допускає null** — очищення поля генерує `null` і ніколи не `0`; `-0` стає `0`. Кнопки кроку починають з `min ?? 0`, тож із порожнього поля потрапляють на `min + step` (`step`, якщо `min` немає). Рідні ArrowUp/ArrowDown із порожнього поля — це поведінка браузера, і вони ведуть до `min`
- **Обмеження меж** — значення обмежується діапазоном min/max при blur (крім поля з `readonly`, яке blur не обмежує) і при кроці; `disabled` і `readonly` блокують кнопки кроку
- **Точне десяткове округлення** — кількість знаків після коми задається пропом `decimalPlaces`; `1.005` з 2 знаками дає `1.01`, кроки `0.1 + 0.2` дають `0.3`. Точність — більше з `decimalPlaces` і кількості знаків `step`
- **Хибне введення очищується** — хибне нативне введення (самотній `-`, `e`, кінцева `.`, як-от `1.` у Chrome) очищується при blur, а значення стає `null`
- **Кнопки збільшення/зменшення** — клік змінює значення на величину кроку (Vertical і Horizontal)
- **Доступні кнопки** — кнопки мають назви з vue-i18n (`numberInput.increase` / `numberInput.decrease`) і пропускаються Tab (`tabindex="-1"`); з клавіатури керують стрілками вгору/вниз у полі (патерн spinbutton)
- **Натиснути й утримувати** — утримання кнопки безперервно змінює значення після затримки 500 мс (Vertical і Horizontal)

## Пропси

| Проп            | Тип                                     | За замовчуванням | Опис                                                             |
| --------------- | --------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| `modelValue`    | `number \| null`                        | `null`           | Значення поля (v-model); порожнє — `null`                        |
| `layout`        | `"vertical" \| "horizontal" \| "inner"` | `"vertical"`     | Позиція підпису відносно поля                                    |
| `min`           | `number`                                | `undefined`      | Мінімальне допустиме значення                                    |
| `max`           | `number`                                | `undefined`      | Максимальне допустиме значення                                   |
| `step`          | `number`                                | `1`              | Величина зміни за один крок                                      |
| `decimalPlaces` | `number`                                | `0`              | Знаків, до яких округлюється значення (не менше за знаки `step`) |
| `label`         | `string`                                | `undefined`      | Текст підпису                                                    |
| `placeholder`   | `string`                                | `undefined`      | Текст-заповнювач                                                 |

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
