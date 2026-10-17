# Tooltip

Показує контекстну інформацію під час наведення або фокусу.

## Живе демо

<script setup>
import { ref } from 'vue'
</script>

<div class="demo-container">
  <h3>Розміщення</h3>
  <div class="demo-row">
    <orio-tooltip text="Підказка згори" placement="top">
      <orio-button variant="secondary">Згори</orio-button>
    </orio-tooltip>
    <orio-tooltip text="Підказка знизу" placement="bottom">
      <orio-button variant="secondary">Знизу</orio-button>
    </orio-tooltip>
    <orio-tooltip text="Підказка ліворуч" placement="left">
      <orio-button variant="secondary">Ліворуч</orio-button>
    </orio-tooltip>
    <orio-tooltip text="Підказка праворуч" placement="right">
      <orio-button variant="secondary">Праворуч</orio-button>
    </orio-tooltip>
  </div>

  <h3>З іконками</h3>
  <div class="demo-row">
    <orio-tooltip text="Редагувати">
      <orio-icon name="edit" :size="24" />
    </orio-tooltip>
    <orio-tooltip text="Видалити">
      <orio-icon name="delete" :size="24" />
    </orio-tooltip>
    <orio-tooltip text="Налаштування">
      <orio-icon name="settings" :size="24" />
    </orio-tooltip>
  </div>

  <h3>Власний вміст</h3>
  <div class="demo-row">
    <orio-tooltip placement="top">
      <orio-button variant="secondary">Власний вміст</orio-button>
      <template #content>
        <div style="padding: 0.25rem;">
          <strong>Розширений вміст</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem;">
            Підказки можуть містити будь-який вміст
          </p>
        </div>
      </template>
    </orio-tooltip>
  </div>

  <h3>Із затримкою</h3>
  <div class="demo-row">
    <orio-tooltip text="З'являється через 500 мс" :delay="500">
      <orio-button variant="secondary">Із затримкою</orio-button>
    </orio-tooltip>
  </div>
</div>

## Використання

```vue
<template>
  <!-- Simple text tooltip -->
  <orio-tooltip text="Hello World">
    <orio-button variant="secondary">Hover me</orio-button>
  </orio-tooltip>

  <!-- Custom content slot -->
  <orio-tooltip placement="top">
    <orio-button variant="secondary">Hover me</orio-button>
    <template #content>
      <div>Custom HTML content</div>
    </template>
  </orio-tooltip>

  <!-- With delay -->
  <orio-tooltip text="Delayed" :delay="300">
    <orio-button variant="secondary">Hover me</orio-button>
  </orio-tooltip>
</template>
```

## Пропси

| Проп        | Тип                                      | За замовчуванням | Опис                                        |
| ----------- | ---------------------------------------- | ---------------- | ------------------------------------------- |
| `text`      | `string`                                 | `undefined`      | Текст підказки (якщо не використовується слот content) |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`          | Позиція підказки відносно тригера           |
| `delay`     | `number`                                 | `500`            | Затримка перед показом підказки (мс)        |
| `disabled`  | `boolean`                                | `false`          | Вимкнути підказку                           |
| `offset`    | `number`                                 | `8`              | Відстань від елемента-тригера (px)          |

## Слоти

| Слот      | Опис                                             |
| --------- | ------------------------------------------------ |
| `default` | Елемент-тригер                                   |
| `content` | Власний вміст підказки (перекриває проп `text`)  |

## Можливості

- Автоматичне позиціювання зі стрілкою-вказівником
- Показується під час наведення та фокусу (доступно з клавіатури)
- Телепортується в body, щоб уникнути проблем із z-index
- Оновлює позицію під час прокручування та зміни розміру
- Налаштовувана затримка
- Підтримка власного вмісту через слот
- Темна тема за замовчуванням
