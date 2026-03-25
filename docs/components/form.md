# Form

Semantic form wrapper with submit handling, loading, and disabled states.

## Live Demo

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

### Basic

<div class="demo-container">
  <orio-form v-model="payload" @submit="handleSubmit">
    <orio-input name="name" label="Name" placeholder="Enter your name" />
    <orio-input name="email" label="Email" type="email" placeholder="you@example.com" />
    <orio-textarea name="message" label="Message" placeholder="Write something..." />
    <orio-button type="submit" :loading="isLoading">
      {{ submitted ? 'Submitted!' : 'Submit' }}
    </orio-button>
  </orio-form>
</div>

### Disabled

<div class="demo-container">
  <orio-form v-model="payload" disabled @submit="handleSubmit">
    <orio-input name="name" label="Name" />
    <orio-input name="email" label="Email" />
    <orio-button type="submit">Submit</orio-button>
  </orio-form>
</div>

## Usage

### Basic

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

### With Validation

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

### Loading & Disabled

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

## Props

| Prop       | Type      | Default | Description                            |
| ---------- | --------- | ------- | -------------------------------------- |
| `disabled` | `boolean` | `false` | Disables all form interaction          |
| `loading`  | `boolean` | `false` | Prevents interaction during async work |

## Events

| Event    | Payload | Description                                              |
| -------- | ------- | -------------------------------------------------------- |
| `submit` | -       | Emitted on form submit (prevented when disabled/loading) |

## Slots

| Slot      | Description                          |
| --------- | ------------------------------------ |
| `default` | Form content (inputs, buttons, etc.) |
