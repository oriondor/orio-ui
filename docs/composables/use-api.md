# useApi

A simple wrapper around `ofetch` for making HTTP requests with TypeScript support.

## Basic Usage

```vue
<script setup>
const data = await useApi('/api/users')
</script>
```

## GET Request

```vue
<script setup>
const users = await useApi<User[]>('/api/users')

// With query parameters
const filtered = await useApi('/api/users', {
  query: {
    role: 'admin',
    active: true
  }
})
</script>
```

## POST Request

```vue
<script setup>
const newUser = await useApi('/api/users', {
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})
</script>
```

## PUT/PATCH Request

```vue
<script setup>
const updated = await useApi('/api/users/123', {
  method: 'PUT',
  body: {
    name: 'Jane Doe'
  }
})

// PATCH for partial updates
const patched = await useApi('/api/users/123', {
  method: 'PATCH',
  body: {
    email: 'jane@example.com'
  }
})
</script>
```

## DELETE Request

```vue
<script setup>
await useApi('/api/users/123', {
  method: 'DELETE'
})
</script>
```

## TypeScript Support

```typescript
interface User {
  id: number
  name: string
  email: string
}

// Type the response
const user = await useApi<User>('/api/users/123')
console.log(user.name) // TypeScript knows this is a string

// Type for array responses
const users = await useApi<User[]>('/api/users')
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | The API endpoint URL |
| `options` | `ApiOptions` | Optional request configuration |

## ApiOptions

```typescript
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: Record<string, unknown>
  signal?: AbortSignal
  query?: Record<string, unknown>
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `method` | `RequestMethod` | `'GET'` | HTTP method |
| `body` | `Record<string, unknown>` | - | Request body (auto-stringified) |
| `signal` | `AbortSignal` | - | AbortController signal for cancellation |
| `query` | `Record<string, unknown>` | - | URL query parameters |

## Examples

### With Abort Controller

```vue
<script setup>
const controller = new AbortController()

// Start request
const promise = useApi('/api/long-request', {
  signal: controller.signal
})

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000)

try {
  const data = await promise
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was cancelled')
  }
}
</script>
```

### Error Handling

```vue
<script setup>
const loading = ref(false)
const error = ref(null)
const data = ref(null)

async function fetchData() {
  loading.value = true
  error.value = null

  try {
    data.value = await useApi('/api/users')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>{{ data }}</div>
</template>
```

### In a Component with Reactive Data

```vue
<script setup>
const userId = ref('123')
const user = ref(null)

watch(userId, async (id) => {
  user.value = await useApi(`/api/users/${id}`)
}, { immediate: true })
</script>

<template>
  <div>
    <input v-model="userId" placeholder="Enter user ID" />
    <div v-if="user">{{ user.name }}</div>
  </div>
</template>
```

### Combining with useModal

```vue
<script setup>
const { modalProps, openModal } = useModal()
const users = ref([])

async function loadUsers() {
  users.value = await useApi('/api/users')
}

async function deleteUser(id, event) {
  openModal(event)

  // Show confirmation modal
  // On confirm:
  await useApi(`/api/users/${id}`, { method: 'DELETE' })
  await loadUsers() // Refresh list
  modalProps.value.show = false
}

onMounted(loadUsers)
</script>
```

### Form Submission

```vue
<script setup>
const form = reactive({
  name: '',
  email: '',
  password: ''
})

const submitting = ref(false)
const error = ref(null)

async function handleSubmit() {
  submitting.value = true
  error.value = null

  try {
    const response = await useApi('/api/register', {
      method: 'POST',
      body: form
    })

    // Success - redirect or show message
    console.log('Registered:', response)
  } catch (err) {
    error.value = err.data?.message || 'Registration failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <orio-input v-model="form.name" label="Name" required />
    <orio-input v-model="form.email" type="email" label="Email" required />
    <orio-input v-model="form.password" type="password" label="Password" required />

    <div v-if="error" class="error">{{ error }}</div>

    <orio-button variant="primary" :loading="submitting">
      Register
    </orio-button>
  </form>
</template>
```

## Features

- Built on `ofetch` for robust HTTP handling
- TypeScript support with generics
- Automatic JSON parsing
- Query parameter serialization
- Request cancellation via AbortSignal
- Works seamlessly with Nuxt 3

## See Also

- [ofetch documentation](https://github.com/unjs/ofetch)
