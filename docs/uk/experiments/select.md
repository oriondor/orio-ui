# Select (експеримент)

::: warning ЕКСПЕРИМЕНТ
Постачається як підшлях `orio-ui/experiments`, **а не** як компонент з
автоімпортом. Назви, пропси й поведінка можуть змінитися в будь-якому релізі,
навіть у патчі. Використовуйте `<orio-selector>`, коли потрібна стабільність або множинний вибір.
:::

Listbox з одиночним вибором, побудований на [експерименті з нативним поповером](./popover), тож
розміщення, закриття кліком поза ним, Esc і перевертання біля країв забезпечує браузер,
а не JS.

## Живе демо

<script setup>
import { ref } from 'vue'

const framework = ref(null)
const country = ref(null)

const frameworks = ['Nuxt', 'Vue', 'Svelte', 'Astro']
const countries = [
  { id: 'uk', name: 'Велика Британія' },
  { id: 'fi', name: 'Фінляндія' },
  { id: 'ua', name: 'Україна' },
]
</script>

<div class="demo-container">
  <div class="demo-row">
    <orio-x-select
      v-model="framework"
      :options="frameworks"
      label="Фреймворк"
    />
  </div>
  <p>Вибрано: {{ framework ?? '—' }}</p>
</div>

Опції-об'єкти з ключем `field` і підписом `option-name`:

<div class="demo-container">
  <div class="demo-row">
    <orio-x-select
      v-model="country"
      :options="countries"
      field="id"
      option-name="name"
      label="Країна"
    />
  </div>
  <p>Вибрано: {{ country?.name ?? '—' }}</p>
</div>

## Використання

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Select } from "orio-ui/experiments";

const country = ref(null);
const countries = [
  { id: "uk", name: "United Kingdom" },
  { id: "fi", name: "Finland" },
  { id: "ua", name: "Ukraine" },
];
</script>

<template>
  <Select
    v-model="country"
    :options="countries"
    field="id"
    option-name="name"
    label="Country"
  />
</template>
```

Демо на цій сторінці використовують `<orio-x-select>` — глобальний псевдонім лише для документації.

## Пропси

| Проп          | Тип                 | За замовчуванням       | Опис                                         |
| ------------- | ------------------- | ---------------------- | -------------------------------------------- |
| `options`     | `SelectOption[]`    | —                      | Рядки або об'єкти; обов'язковий              |
| `field`       | `string`            | `'id'`                 | Ключ ідентичності для опцій-об'єктів         |
| `optionName`  | `string`            | —                      | Ключ підпису для опцій-об'єктів              |
| `placeholder` | `string`            | `t('selector.placeholder')` | Текст тригера, коли нічого не вибрано   |

Розміщення не налаштовується: панель завжди відкривається під тригером, вирівняна
за лівим краєм, і перевертається біля краю в'юпорту. Ця поведінка та її пропси живуть
у [Popover](./popover) — цей компонент лише обирає бік.

Усе з `ControlProps` (`label`, `size`, `error`, `layout`, `disabled`,
`required`, …) як зазвичай передається в `<orio-control-element>`.

## v-model

Обов'язкова і зберігає саму опцію — рядок або весь об'єкт, — а ніколи не
витягнутий ключ:

```ts
const country = ref<{ id: string; name: string } | null>(null);
```

Опції-об'єкти порівнюються за `field`, тож повторно завантажений список із новими
екземплярами об'єктів зберігає вибір.

## Слоти

| Слот            | Пропси                                                      | Опис                           |
| --------------- | ----------------------------------------------------------- | ------------------------------ |
| `trigger`       | `{ trigger, control, isOpen, getOptionKey, getOptionLabel }` | Замінює всю кнопку |
| `trigger-label` | `{ getOptionKey, getOptionLabel }`                           | Замінює лише текст підпису     |
| `option`        | `{ option, selected, getOptionKey, getOptionLabel }`         | Замінює вміст рядка            |
| `no-options`    | —                                                            | Замінює порожній стан          |
| `options-addon` | —                                                            | Додатковий вміст після списку  |

`trigger` — повний набір прив'язок: зв'язка з поповером (`popovertarget`),
a11y-атрибути ControlElement (`id`, `aria-*`, `disabled`, …), `type="button"`,
ARIA-стан listbox (`aria-haspopup`, `aria-expanded`) і обробник клавіатури.
Власний `#trigger` мусить розгорнути його на `<button>` — без нього панель
нічим відкрити, а listbox втрачає ARIA та підтримку клавіатури:

```vue
<template #trigger="{ trigger }">
  <button v-bind="trigger">Open</button>
</template>
```

## Клавіатура

| Клавіша | Поведінка |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Відкриває, якщо закрито; переміщує підсвічування, якщо відкрито |
| `Home` / `End` | Перехід до першої / останньої опції |
| `Enter` | Вибирає підсвічену опцію |
| `Esc` | Закриває — нативно обробляється поповером |

Щоразу, коли панель відкривається, підсвічування починається з поточної вибраної опції.

## Порівняння з `<orio-selector>`

| | `<orio-selector>` | `<orio-x-select>` |
| --- | --- | --- |
| Множинний вибір | так | ні, лише одиночний |
| Панель | `<orio-popover>`, телепортована | нативний поповер, top layer |
| Стан відкриття | Vue ref + слот-проп `toggle` | DOM, читається з події `toggle` |
| Esc / закриття кліком поза | лише клік поза | браузер |
| Слоти | 6, зокрема `trigger-content` | 5 |

## Не реалізовано

- Множинний вибір, чипи-теги та слот `trigger-content`
- Вбудований пошук чи фільтрація (використовуйте `#options-addon`)
- `aria-activedescendant` — підсвічування візуальне, фокус лишається на
  тригері
