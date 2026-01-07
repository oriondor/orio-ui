# useFuzzySearch

A wrapper around Fuse.js for fuzzy searching through arrays of strings or objects.

## Basic Usage (String Array)

```vue
<script setup>
const fruits = ref(['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'])
const searchQuery = ref('')

const filteredFruits = useFuzzySearch(fruits, searchQuery)
</script>

<template>
  <orio-input v-model="searchQuery" placeholder="Search fruits..." />

  <ul>
    <li v-for="fruit in filteredFruits" :key="fruit">
      {{ fruit }}
    </li>
  </ul>
</template>
```

## Object Array Search

```vue
<script setup>
interface User {
  id: number
  name: string
  email: string
  role: string
}

const users = ref<User[]>([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
])

const searchQuery = ref('')

const filteredUsers = useFuzzySearch(users, searchQuery, {
  keys: ['name', 'email']
})
</script>

<template>
  <orio-input v-model="searchQuery" placeholder="Search users..." />

  <div v-for="user in filteredUsers" :key="user.id">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
  </div>
</template>
```

## Parameters

### String Array

```typescript
useFuzzySearch(
  dataSource: MaybeRef<string[]>,
  search: MaybeRef<string>
): ComputedRef<string[]>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `dataSource` | `MaybeRef<string[]>` | Array of strings to search |
| `search` | `MaybeRef<string>` | Search query string |

### Object Array

```typescript
useFuzzySearch<T>(
  dataSource: MaybeRef<T[]>,
  search: MaybeRef<string>,
  options: FuseOptions<T>
): ComputedRef<T[]>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `dataSource` | `MaybeRef<T[]>` | Array of objects to search |
| `search` | `MaybeRef<string>` | Search query string |
| `options` | `FuseOptions<T>` | Fuse.js configuration options |

## Common Fuse.js Options

```typescript
interface FuseOptions<T> {
  keys?: string[]           // Object keys to search
  threshold?: number        // 0.0 = exact, 1.0 = match anything
  distance?: number         // Max distance for matches
  minMatchCharLength?: number  // Min chars to match
  includeScore?: boolean    // Include match scores
  shouldSort?: boolean      // Sort by match quality
}
```

## Examples

### Search with Threshold

Lower threshold = stricter matching:

```vue
<script setup>
const products = ref([
  { id: 1, name: 'Laptop', category: 'Electronics' },
  { id: 2, name: 'Notebook', category: 'Stationery' },
  { id: 3, name: 'Headphones', category: 'Electronics' }
])

const search = ref('')

// Strict matching (threshold: 0.3)
const results = useFuzzySearch(products, search, {
  keys: ['name', 'category'],
  threshold: 0.3
})
</script>
```

### Multi-field Search

Search across multiple fields:

```vue
<script setup>
const articles = ref([
  {
    title: 'Getting Started with Vue',
    author: 'John Doe',
    tags: ['vue', 'javascript', 'frontend']
  },
  {
    title: 'Advanced TypeScript',
    author: 'Jane Smith',
    tags: ['typescript', 'javascript', 'types']
  }
])

const search = ref('')

const results = useFuzzySearch(articles, search, {
  keys: ['title', 'author', 'tags']
})
</script>
```

### Weighted Search

Give more importance to certain fields:

```vue
<script setup>
const movies = ref([
  { title: 'Inception', director: 'Christopher Nolan', year: 2010 },
  { title: 'Interstellar', director: 'Christopher Nolan', year: 2014 }
])

const search = ref('')

const results = useFuzzySearch(movies, search, {
  keys: [
    { name: 'title', weight: 2 },      // Title is more important
    { name: 'director', weight: 1 }
  ]
})
</script>
```

### Search with Selector Component

```vue
<script setup>
const allCountries = ref([
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Canada',
  'Australia'
])

const searchQuery = ref('')
const selectedCountry = ref('')

const filteredCountries = useFuzzySearch(allCountries, searchQuery)
</script>

<template>
  <orio-selector
    v-model="selectedCountry"
    :options="filteredCountries"
    placeholder="Select a country"
    searchable
    @search="searchQuery = $event"
  />
</template>
```

### Dynamic Data from API

```vue
<script setup>
interface Product {
  id: number
  name: string
  description: string
  price: number
}

const products = ref<Product[]>([])
const searchQuery = ref('')

const filteredProducts = useFuzzySearch(products, searchQuery, {
  keys: ['name', 'description'],
  threshold: 0.4
})

onMounted(async () => {
  products.value = await useApi<Product[]>('/api/products')
})
</script>

<template>
  <orio-input v-model="searchQuery" placeholder="Search products..." />

  <div class="products">
    <div v-for="product in filteredProducts" :key="product.id">
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <p>${{ product.price }}</p>
    </div>
  </div>
</template>
```

### Empty State Handling

```vue
<script setup>
const items = ref(['Apple', 'Banana', 'Cherry'])
const search = ref('')

const results = useFuzzySearch(items, search)
</script>

<template>
  <orio-input v-model="search" placeholder="Search..." />

  <orio-empty-state
    v-if="results.length === 0 && search"
    message="No results found"
    :description="`No items match '${search}'`"
  />

  <ul v-else>
    <li v-for="item in results" :key="item">{{ item }}</li>
  </ul>
</template>
```

### Real-time Filtering

```vue
<script setup>
const todos = ref([
  { id: 1, title: 'Buy groceries', completed: false },
  { id: 2, title: 'Write documentation', completed: true },
  { id: 3, title: 'Review pull requests', completed: false }
])

const search = ref('')

const filteredTodos = useFuzzySearch(todos, search, {
  keys: ['title']
})

function addTodo(title: string) {
  todos.value.push({
    id: Date.now(),
    title,
    completed: false
  })
}
</script>

<template>
  <orio-input v-model="search" placeholder="Search todos..." />

  <div v-for="todo in filteredTodos" :key="todo.id">
    <orio-checkbox v-model="todo.completed" :label="todo.title" />
  </div>
</template>
```

## Features

- Fuzzy matching with configurable threshold
- Works with both strings and objects
- Reactive search - results update automatically
- Shows all items when search is empty
- Built on Fuse.js via VueUse integration
- TypeScript support with generics
- Supports weighted multi-field search

## Return Value

Returns a computed ref containing the filtered results:
- For string arrays: `ComputedRef<string[]>`
- For object arrays: `ComputedRef<T[]>`

Results automatically update when either `dataSource` or `search` changes.

## See Also

- [Fuse.js Documentation](https://fusejs.io/)
- [VueUse useFuse](https://vueuse.org/integrations/useFuse/)
- [Selector Component](/components/selector)
