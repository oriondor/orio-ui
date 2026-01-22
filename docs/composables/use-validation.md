# useValidation

Form validation composable with error handling and auto-scroll to first invalid field.

## Live Demo

<script setup>
import { ref } from 'vue'
import { useValidation, isFilled, isEmail } from '../../src/runtime/composables/useValidation'

const name = ref('')
const email = ref('')
const message = ref('')

const { checkValidity, errors, clearError, clearAllErrors } = useValidation([
  { model: name, id: 'demo-name', validator: isFilled, message: 'Name is required' },
  { model: email, id: 'demo-email', validator: isEmail, message: 'Invalid email format' },
  { model: email, id: 'demo-email', validator: isFilled, message: 'Email is required' },
  { model: message, id: 'demo-message', validator: isFilled, message: 'Message is required' },
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
    label="Name"
    placeholder="Enter your name"
    :error="errors['demo-name']"
    @input="clearError('demo-name')"
  />

<orio-input
id="demo-email"
v-model="email"
label="Email"
placeholder="Enter your email"
:error="errors['demo-email']"
@input="clearError('demo-email')"
/>

<orio-textarea
id="demo-message"
v-model="message"
label="Message"
placeholder="Enter your message"
:error="errors['demo-message']"
@input="clearError('demo-message')"
/>

  <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
    <orio-button @click="handleSubmit">Submit</orio-button>
    <orio-button variant="secondary" @click="handleReset">Reset</orio-button>
  </div>

<orio-badge v-if="submitted" variant="success" style="margin-top: 1rem;">Form submitted successfully!</orio-badge>

</div>

## Basic Usage

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

## Multiple Fields

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

## Custom Validators

```vue
<script setup>
import { ref, isRef } from "vue";
import { useValidation, isFilled } from "orio-ui";

const email = ref("");
const age = ref("");
const password = ref("");

// Custom validator for email format
function isValidEmail(model) {
  const value = isRef(model) ? model.value : model;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// Custom validator for minimum value
function isAdult(model) {
  const value = isRef(model) ? model.value : model;
  return parseInt(value) >= 18;
}

// Custom validator for password strength
function isStrongPassword(model) {
  const value = isRef(model) ? model.value : model;
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
  validator: (model: MaybeRef<any>) => boolean; // Validation function
  message?: string; // Error message (default: "This field is required")
}
```

### isFilled

Built-in validator for checking if a string or array has content:

```typescript
function isFilled(model: MaybeRef<string | []>): boolean;
```

## Parameters

| Parameter | Type               | Description               |
| --------- | ------------------ | ------------------------- |
| `rules`   | `ValidationRule[]` | Array of validation rules |

## Return Value

| Property         | Type                             | Description                                     |
| ---------------- | -------------------------------- | ----------------------------------------------- |
| `checkValidity`  | `() => boolean`                  | Validates all rules, returns `true` if all pass |
| `errors`         | `Record<string, string \| null>` | Reactive object with error messages by ID       |
| `clearError`     | `(id: string) => void`           | Clears error for specific field                 |
| `clearAllErrors` | `() => void`                     | Clears all errors                               |

## Features

- Auto-scrolls to first invalid field on validation failure
- Reactive error state
- Supports custom validators
- Multiple validators per field
- Built-in `isFilled` validator
- Works with any input component
