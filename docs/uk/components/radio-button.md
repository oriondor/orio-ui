# RadioButton

Власний компонент радіокнопки. Щоб згрупувати радіокнопки, використовуйте спільну `v-model` і унікальні пропси `value` — вибрати можна лише одну.

## Живе демо

<script setup>
import { ref } from 'vue'

const plan = ref('monthly')
const size = ref('md')
</script>

<div class="demo-container">
  <div class="demo-grid">
    <orio-radio-button v-model="plan" name="plan" value="monthly">Щомісяця</orio-radio-button>
    <orio-radio-button v-model="plan" name="plan" value="yearly">Щороку</orio-radio-button>
    <orio-radio-button v-model="plan" name="plan" value="lifetime">Довічно</orio-radio-button>
  </div>
</div>

<div class="demo-output">
  <strong>Вибраний план:</strong> {{ plan }}
</div>

## Прихований підпис

Підпис візуально приховано, але скрінрідери його все одно озвучують.

<div class="demo-container">
  <div class="demo-grid">
    <orio-radio-button v-model="size" name="size" value="sm" text="Малий" hide-label />
    <orio-radio-button v-model="size" name="size" value="md" text="Середній" hide-label />
    <orio-radio-button v-model="size" name="size" value="lg" text="Великий" hide-label />
  </div>
</div>

<div class="demo-output">
  <strong>Вибраний розмір:</strong> {{ size }}
</div>

## Використання

```vue
<template>
  <orio-radio-button v-model="plan" name="plan" value="monthly">Monthly</orio-radio-button>
  <orio-radio-button v-model="plan" name="plan" value="yearly">Yearly</orio-radio-button>
  <orio-radio-button v-model="plan" name="plan" value="lifetime">Lifetime</orio-radio-button>
</template>

<script setup>
import { ref } from 'vue'

const plan = ref('monthly')
</script>
```

## Пропси

| Проп         | Тип       | За замовчуванням | Опис                                                             |
| ------------ | --------- | ---------------- | ---------------------------------------------------------------- |
| `modelValue` | `unknown` | -                | Спільне значення групи (v-model); радіокнопка позначена, коли воно збігається з `value` |
| `value`      | `unknown` | -                | Значення, яке представляє ця радіокнопка                         |
| `name`       | `string`  | -                | HTML-атрибут `name` — групує радіокнопки для навігації з клавіатури та надсилання форми |
| `text`       | `string`  | -                | Текст підпису (альтернатива слоту за замовчуванням)              |
| `hideLabel`  | `boolean` | `false`          | Візуально приховує підпис, залишаючи його доступним для скрінрідерів |

## Події

| Подія               | Дані      | Опис                                  |
| ------------------- | --------- | ------------------------------------- |
| `update:modelValue` | `unknown` | Генерується, коли радіокнопку вибрано |

## Слоти

| Слот      | Пропси | Опис                                          |
| --------- | ------ | --------------------------------------------- |
| `default` | -      | Текст / вміст підпису (перекриває проп `text`) |
