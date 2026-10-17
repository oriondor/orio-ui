# AnimatedContainer

Flex-контейнер, що під час монтування анімує дочірні елементи ефектом появи знизу.

## Живе демо

<script setup>
import { ref } from 'vue'
const key = ref(0)
const replay = () => key.value++
</script>

<style>
.demo-item {
  padding: 1rem 2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  transition: border-color 0.2s ease;
}
.demo-item:hover {
  border-color: var(--vp-c-brand);
}
</style>

<orio-button size="small" @click="replay">Повторити анімацію</orio-button>

### Горизонтально (рядок)

<div class="demo-container">
  <orio-animated-container :key="key">
    <div class="demo-item">Елемент 1</div>
    <div class="demo-item">Елемент 2</div>
    <div class="demo-item">Елемент 3</div>
  </orio-animated-container>
</div>

### Вертикально (стовпчик) і зі звуком під час наведення

<div class="demo-container">
  <orio-animated-container :key="key" direction="column" v-slot="{ play }">
    <div class="demo-item" @mouseenter="play">Елемент 1</div>
    <div class="demo-item">Елемент 2 (без звуку)</div>
    <div class="demo-item" @mouseenter="play">Елемент 3</div>
  </orio-animated-container>
</div>

## Використання

### Горизонтальне розміщення (за замовчуванням)

```vue
<template>
  <orio-animated-container>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </orio-animated-container>
</template>
```

### Вертикальне розміщення

```vue
<template>
  <orio-animated-container direction="column">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </orio-animated-container>
</template>
```

### Зі звуком під час наведення

```vue
<template>
  <orio-animated-container v-slot="{ play }">
    <div @mouseenter="play">Item 1</div>
    <div @mouseenter="play">Item 2</div>
    <div @mouseenter="play">Item 3</div>
  </orio-animated-container>
</template>
```

## Пропси

| Проп        | Тип                   | За замовчуванням | Опис                          |
| ----------- | --------------------- | ---------------- | ----------------------------- |
| `direction` | `"row"` \| `"column"` | `"row"`          | Напрямок розміщення контейнера |

## Слоти

| Слот      | Пропси               | Опис                 |
| --------- | -------------------- | -------------------- |
| `default` | `{ play: Function }` | Вміст для анімації   |

## Примітки

- Усі прямі дочірні елементи анімуються ефектом появи знизу (0.5s ease-out)
- Дочірні елементи зсуваються з позиції на 30px нижче кінцевої
- Контейнер використовує `flex-wrap: wrap` для адаптивних макетів
- Відступ між елементами за замовчуванням — `1rem`
