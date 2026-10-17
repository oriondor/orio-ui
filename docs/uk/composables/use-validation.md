# useValidation

Композабл для валідації форм з обробкою помилок і автопрокручуванням до першого некоректного поля.

## Живе демо

<script setup>
import { ref } from 'vue'
import { useValidation, isFilled, isEmail } from '../../../src/runtime/composables/useValidation'

const name = ref('')
const email = ref('')
const message = ref('')

const { checkValidity, errors, clearError, clearAllErrors } = useValidation([
  { model: name, id: 'demo-name', validator: isFilled, message: "Ім'я обов'язкове" },
  { model: email, id: 'demo-email', validator: isEmail, message: 'Некоректний формат email' },
  { model: email, id: 'demo-email', validator: isFilled, message: "Email обов'язковий" },
  { model: message, id: 'demo-message', validator: isFilled, message: "Повідомлення обов'язкове" },
])

const submitted = ref(false)

function handleSubmit() {
  submitted.value = false
  if (checkValidity()) {
    submitted.value = true
  }
}

function handleReset() {
  name.value = ''
  email.value = ''
  message.value = ''
  submitted.value = false
  clearAllErrors()
}
</script>

<div class="demo-container">
  <orio-input
    id="demo-name"
    v-model="name"
    label="Ім'я"
    layout="inner"
    placeholder="Введіть ім'я"
    :error="errors['demo-name']"
    @input="clearError('demo-name')"
  />
  <orio-input
    id="demo-email"
    v-model="email"
    label="Email"
    layout="inner"
    placeholder="Введіть email"
    :error="errors['demo-email']"
    @input="clearError('demo-email')"
  />
  <orio-textarea
    id="demo-message"
    v-model="message"
    label="Повідомлення"
    placeholder="Введіть повідомлення"
    :error="errors['demo-message']"
    @input="clearError('demo-message')"
  />

  <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
    <orio-button @click="handleSubmit">Надіслати</orio-button>
    <orio-button variant="secondary" @click="handleReset">Скинути</orio-button>
  </div>

<orio-badge v-if="submitted" variant="success" style="margin-top: 1rem;">Форму успішно надіслано!</orio-badge>

</div>

## Базове використання

```vue
<script setup>
import { ref } from "vue";
import { useValidation, isFilled } from "orio-ui";

const name = ref("");

// Validation happens bottom to top, place your validations accordingly
const { checkValidity, errors, clearError } = useValidation([
  { model: name, id: "name", validator: isFilled, message: "Name is required" },
]);

function handleSubmit() {
  if (checkValidity()) {
    // Form is valid, submit data
  }
}
</script>

<template>
  <orio-input
    id="name"
    v-model="name"
    label="Name"
    :error="errors['name']"
    @input="clearError('name')"
  />

  <orio-button @click="handleSubmit">Submit</orio-button>
</template>
```

## Кілька полів

```vue
<script setup>
import { ref } from "vue";
import { useValidation, isFilled } from "orio-ui";

const name = ref("");
const email = ref("");
const message = ref("");

const { checkValidity, errors, clearError, clearAllErrors } = useValidation([
  { model: name, id: "name", validator: isFilled, message: "Name is required" },
  {
    model: email,
    id: "email",
    validator: isFilled,
    message: "Email is required",
  },
  {
    model: message,
    id: "message",
    validator: isFilled,
    message: "Message is required",
  },
]);

function handleSubmit() {
  if (checkValidity()) {
    // All fields valid
  }
}

function handleReset() {
  name.value = "";
  email.value = "";
  message.value = "";
  clearAllErrors();
}
</script>

<template>
  <orio-input
    id="name"
    v-model="name"
    label="Name"
    :error="errors['name']"
    @input="clearError('name')"
  />

  <orio-input
    id="email"
    v-model="email"
    label="Email"
    :error="errors['email']"
    @input="clearError('email')"
  />

  <orio-textarea
    id="message"
    v-model="message"
    label="Message"
    :error="errors['message']"
    @input="clearError('message')"
  />

  <orio-button @click="handleSubmit">Submit</orio-button>
  <orio-button variant="secondary" @click="handleReset">Reset</orio-button>
</template>
```

## Власні валідатори

```vue
<script setup>
import { ref } from "vue";
import { useValidation, isFilled } from "orio-ui";

const email = ref("");
const age = ref("");
const password = ref("");

// The composable unwraps refs automatically — validators always receive a plain value
function isValidEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function isAdult(value) {
  return parseInt(value) >= 18;
}

function isStrongPassword(value) {
  return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
}

const { checkValidity, errors, clearError } = useValidation([
  {
    model: email,
    id: "email",
    validator: isFilled,
    message: "Email is required",
  },
  {
    model: email,
    id: "email",
    validator: isValidEmail,
    message: "Invalid email format",
  },
  { model: age, id: "age", validator: isFilled, message: "Age is required" },
  {
    model: age,
    id: "age",
    validator: isAdult,
    message: "You must be 18 or older",
  },
  {
    model: password,
    id: "password",
    validator: isFilled,
    message: "Password is required",
  },
  {
    model: password,
    id: "password",
    validator: isStrongPassword,
    message: "Password must be 8+ chars with uppercase and number",
  },
]);
</script>

<template>
  <orio-input
    id="email"
    v-model="email"
    label="Email"
    type="email"
    :error="errors['email']"
    @input="clearError('email')"
  />

  <orio-input
    id="age"
    v-model="age"
    label="Age"
    type="number"
    :error="errors['age']"
    @input="clearError('age')"
  />

  <orio-input
    id="password"
    v-model="password"
    label="Password"
    type="password"
    :error="errors['password']"
    @input="clearError('password')"
  />
</template>
```

## API

### useValidation

```typescript
function useValidation(rules: ValidationRule[]): {
  checkValidity: () => boolean;
  errors: Record<string, string | null>;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
};
```

### ValidationRule

```typescript
interface ValidationRule {
  model: MaybeRef<any>; // The reactive value to validate
  id: string; // Element ID (used for error mapping and scroll)
  validator: (value: any) => boolean; // Validation function — receives unwrapped value
  message?: string; // Error message (default: "This field is required")
}
```

### isFilled

Вбудований валідатор, що перевіряє, чи має рядок або масив вміст:

```typescript
function isFilled(value: string | []): boolean;
```

## Параметри

| Параметр  | Тип                | Опис                      |
| --------- | ------------------ | ------------------------- |
| `rules`   | `ValidationRule[]` | Масив правил валідації    |

## Значення, що повертається

| Властивість      | Тип                              | Опис                                            |
| ---------------- | -------------------------------- | ----------------------------------------------- |
| `checkValidity`  | `() => boolean`                  | Перевіряє всі правила, повертає `true`, якщо всі пройдено |
| `errors`         | `Record<string, string \| null>` | Реактивний об'єкт з повідомленнями про помилки за ID |
| `clearError`     | `(id: string) => void`           | Очищає помилку конкретного поля                 |
| `clearAllErrors` | `() => void`                     | Очищає всі помилки                              |

## Можливості

- Автоматично прокручує до першого некоректного поля, якщо валідація не пройшла
- Реактивний стан помилок
- Підтримка власних валідаторів
- Кілька валідаторів на одне поле
- Вбудований валідатор `isFilled`
- Працює з будь-яким компонентом поля
