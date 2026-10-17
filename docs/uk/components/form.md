# Form

Семантична обгортка форми з обробкою надсилання, станами завантаження та вимкнення.

## Живе демо

<script setup>
import { ref, reactive } from 'vue'

const payload = ref({
  name: "",
  email: "",
  message: "",
})
const isLoading = ref(false)
const isDisabled = ref(false)
const submitted = ref(false)

function handleSubmit() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    submitted.value = true
  }, 1500)
}
</script>

### Базове

<div class="demo-container">
  <orio-form v-model="payload" @submit="handleSubmit">
    <orio-input name="name" label="Ім'я" placeholder="Введіть ім'я" />
    <orio-input name="email" label="Email" type="email" placeholder="you@example.com" />
    <orio-textarea name="message" label="Повідомлення" placeholder="Напишіть щось..." />
    <orio-button type="submit" :loading="isLoading">
      {{ submitted ? 'Надіслано!' : 'Надіслати' }}
    </orio-button>
  </orio-form>
</div>

### Вимкнена

<div class="demo-container">
  <orio-form v-model="payload" disabled @submit="handleSubmit">
    <orio-input name="name" label="Ім'я" />
    <orio-input name="email" label="Email" />
    <orio-button type="submit">Надіслати</orio-button>
  </orio-form>
</div>

## Використання

### Базове

```vue
<template>
  <orio-form v-model="payload" @submit="onSubmit">
    <orio-input name="email" label="Email" type="email" />
    <orio-button type="submit">Submit</orio-button>
  </orio-form>
</template>

<script setup>
import { ref } from "vue";

const payload = ref({
  email: "",
});

function onSubmit() {
  console.log("Submitted:", payload.value);
}
</script>
```

### З валідацією

```vue
<template>
  <orio-form v-model="payload" @submit="onSubmit">
    <orio-input name="email" label="Email" :error="errors.email" />
    <orio-button type="submit" :loading="isLoading">Submit</orio-button>
  </orio-form>
</template>

<script setup>
import { ref } from "vue";
import { useValidation, isFilled, isEmail } from "orio-ui";

const payload = ref({
  email: "",
});
const isLoading = ref(false);

const { checkValidity, errors } = useValidation([
  {
    model: () => payload.value.email,
    id: "email",
    validator: isFilled,
    message: "Email is required",
  },
  {
    model: () => payload.value.email,
    id: "email",
    validator: isEmail,
    message: "Invalid email",
  },
]);

function onSubmit() {
  if (!checkValidity()) return;
  isLoading.value = true;
  // ...
}
</script>
```

### Завантаження та вимкнення

```vue
<!-- Prevents interaction during async submission -->
<orio-form v-model="payload" :loading="isLoading" @submit="onSubmit">
  ...
</orio-form>

<!-- Fully disabled form -->
<orio-form v-model="payload" disabled>
  ...
</orio-form>
```

## Пропси

| Проп       | Тип       | За замовчуванням | Опис                                        |
| ---------- | --------- | ---------------- | ------------------------------------------- |
| `disabled` | `boolean` | `false`          | Вимикає будь-яку взаємодію з формою         |
| `loading`  | `boolean` | `false`          | Блокує взаємодію під час асинхронної роботи |

## Події

| Подія    | Дані    | Опис                                                              |
| -------- | ------- | ----------------------------------------------------------------- |
| `submit` | -       | Генерується під час надсилання форми (не генерується, коли disabled/loading) |

## Слоти

| Слот      | Опис                                  |
| --------- | ------------------------------------- |
| `default` | Вміст форми (поля, кнопки тощо)       |
