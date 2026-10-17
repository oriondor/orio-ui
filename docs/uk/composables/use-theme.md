# useTheme

Композабл для керування налаштуваннями теми й колірного режиму.

## Живе демо

<script setup>
import { computed } from 'vue'
import { useTheme } from '../../../src/runtime/composables/useTheme'
import { capitalCase } from "change-case";

const { theme, mode, setTheme, setMode } = useTheme()

const themes = [
  { label: 'Navy', value: 'navy' },
  { label: 'Teal', value: 'teal' },
  { label: 'Forest', value: 'forest' },
  { label: 'Wine', value: 'wine' },
  { label: 'Royal', value: 'royal' },
  { label: 'Violet', value: 'violet' },
]

const isDark = computed({
  get: () => mode.value === 'dark',
  set: (val) => setMode(val ? 'dark' : 'light')
})

const selectedTheme = computed(() => themes.find(({ value }) => value === theme.value))
</script>

<div class="demo-container">
  <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
    <orio-selector
      :model-value="selectedTheme"
      :options="themes"
      label="Тема"
      field="value"
      option-name="label"
      @update:model-value="setTheme($event.value)"
    />
    <orio-switch-button v-model="isDark" label="Темний режим">
      Темний режим
    </orio-switch-button>
  </div>
  <p style="margin-top: 1rem;">Поточні: <orio-badge>{{ theme }}</orio-badge> <orio-badge variant="grey">{{ mode }}</orio-badge></p>
</div>

## Базове використання

```vue
<script setup>
const { theme, mode, setTheme, setMode } = useTheme();
</script>
```

## Зміна теми

```vue
<template>
  <div>
    <h2>Choose Theme</h2>
    <orio-button variant="secondary" @click="setTheme('navy')">
      Navy
    </orio-button>
    <orio-button variant="secondary" @click="setTheme('teal')">
      Teal
    </orio-button>
    <orio-button variant="secondary" @click="setTheme('forest')">
      Forest
    </orio-button>
    <orio-button variant="secondary" @click="setTheme('wine')">
      Wine
    </orio-button>
    <orio-button variant="secondary" @click="setTheme('royal')">
      Royal
    </orio-button>
    <orio-button variant="secondary" @click="setTheme('violet')">
      Violet
    </orio-button>

    <p>Current theme: {{ theme }}</p>
  </div>
</template>

<script setup>
const { theme, setTheme } = useTheme();
</script>
```

## Зміна колірного режиму

```vue
<template>
  <orio-button variant="secondary" @click="toggleMode">
    {{ mode === "dark" ? "☀️ Light" : "🌙 Dark" }}
  </orio-button>
</template>

<script setup>
const { mode, setMode } = useTheme();

function toggleMode() {
  setMode(mode.value === "dark" ? "light" : "dark");
}
</script>
```

## Значення, що повертаються

| Властивість | Тип                     | Опис                                       |
| ---------- | ------------------------ | ------------------------------------------ |
| `theme`    | `Ref<string>`            | Назва поточної акцентної теми              |
| `mode`     | `Ref<string>`            | Поточний колірний режим (`'light'` або `'dark'`) |
| `setTheme` | `(name: string) => void` | Функція зміни акцентної теми               |
| `setMode`  | `(mode: string) => void` | Функція зміни колірного режиму             |

## Вбудовані теми

Бібліотека містить вбудовані теми, готові до використання:

### Navy

Глибока синя ділова тема

### Teal

Свіжа бірюзова тема

### Forest

Природна зелена тема

### Wine

Насичена бордова тема

### Royal

Яскрава синя тема

## Збереження

Налаштування теми автоматично зберігаються в `localStorage`:

- `orio-theme` — зберігає акцентну тему
- `orio-mode` — зберігає колірний режим

Налаштування відновлюються під час завантаження сторінки.

## Сумісність із SSR

Композабл коректно працює з SSR:

- операції з localStorage виконуються лише на клієнті
- оновлення DOM обгорнуті в перевірки `typeof document !== 'undefined'`
- тема застосовується під час монтування

## Приклади

### Компонент перемикача тем

```vue
<template>
  <div class="theme-switcher">
    <select v-model="currentTheme" @change="handleThemeChange">
      <option value="navy">Navy</option>
      <option value="teal">Teal</option>
      <option value="forest">Forest</option>
      <option value="wine">Wine</option>
      <option value="royal">Royal</option>
      <option value="violet">Violet</option>
    </select>

    <orio-button variant="secondary" @click="toggleDarkMode">
      {{ isDark ? "Light Mode" : "Dark Mode" }}
    </orio-button>
  </div>
</template>

<script setup>
const { theme, mode, setTheme, setMode } = useTheme();

const currentTheme = computed({
  get: () => theme.value,
  set: (val) => setTheme(val),
});

const isDark = computed(() => mode.value === "dark");

function handleThemeChange() {
  // Theme already updated via v-model
  console.log("Theme changed to:", theme.value);
}

function toggleDarkMode() {
  setMode(isDark.value ? "light" : "dark");
}
</script>
```

### Сторінка налаштувань

```vue
<template>
  <div class="settings">
    <h2>Appearance Settings</h2>

    <div class="setting-group">
      <label>Color Theme</label>
      <div class="theme-options">
        <orio-button
          v-for="t in themes"
          :key="t.value"
          variant="secondary"
          :class="{ active: theme === t.value }"
          @click="setTheme(t.value)"
        >
          {{ t.label }}
        </orio-button>
      </div>
    </div>

    <div class="setting-group">
      <label>Mode</label>
      <div class="mode-toggle">
        <orio-button
          variant="secondary"
          :class="{ active: mode === 'light' }"
          @click="setMode('light')"
        >
          ☀️ Light
        </orio-button>
        <orio-button
          variant="secondary"
          :class="{ active: mode === 'dark' }"
          @click="setMode('dark')"
        >
          🌙 Dark
        </orio-button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { theme, mode, setTheme, setMode } = useTheme();

const themes = [
  { label: "Navy", value: "navy" },
  { label: "Teal", value: "teal" },
  { label: "Forest", value: "forest" },
  { label: "Wine", value: "wine" },
  { label: "Royal", value: "royal" },
  { label: "Violet", value: "violet" },
];
</script>
```

## Власні теми

Система тем повністю налаштовувана. Можна перевизначати наявні теми або створювати зовсім нові, задаючи CSS-змінні у власних стилях.

### Змінні теми

Теми керують акцентними кольорами всього інтерфейсу. Основні змінні, які можна налаштувати:

```css
:root[data-theme="your-theme"] {
  --color-accent: /* Main accent color */ --color-accent-soft:
    /* Light background tint */
    --color-accent-border: /* Border color */;
}
```

`--color-accent-ink`, `--color-accent-hover` і `--color-accent-active` обчислюються автоматично через `color-mix()`.

### Створення нової теми

Визначте тему в CSS застосунку:

```css
/* In your main CSS file or a separate theme file */
:root[data-theme="sunset"] {
  --color-accent: hsl(16 90% 48%);
  --color-accent-soft: hsl(16 100% 96%);
  --color-accent-border: hsl(16 85% 80%);
}

:root[data-theme="ocean"] {
  --color-accent: hsl(199 89% 48%);
  --color-accent-soft: hsl(199 100% 96%);
  --color-accent-border: hsl(199 75% 80%);
}

:root[data-theme="lavender"] {
  --color-accent: hsl(267 65% 58%);
  --color-accent-soft: hsl(267 100% 97%);
  --color-accent-border: hsl(267 50% 85%);
}
```

Потім використовуйте її в застосунку:

```vue
<script setup>
const { setTheme } = useTheme();

// Use your custom theme
setTheme("sunset");
</script>
```

### Перевизначення вбудованих тем

Будь-яку вбудовану тему можна повністю перевизначити, задавши її змінні заново:

```css
/* Override the "navy" theme with your brand colors */
:root[data-theme="navy"] {
  --color-accent: #0066cc; /* Your brand blue */
  --color-accent-soft: #e6f2ff;
  --color-accent-border: #99ccff;
}
```

### Повний приклад власних тем

Ось повний приклад із кількома власними темами:

```css
/* bright-pink.css */
:root[data-theme="bright-pink"] {
  --color-accent: hsl(328 100% 54%);
  --color-accent-soft: hsl(328 100% 97%);
  --color-accent-border: hsl(328 73% 84%);
}

:root[data-theme="mint"] {
  --color-accent: hsl(162 63% 41%);
  --color-accent-soft: hsl(162 60% 96%);
  --color-accent-border: hsl(162 40% 80%);
}

:root[data-theme="amber"] {
  --color-accent: hsl(38 92% 50%);
  --color-accent-soft: hsl(38 100% 96%);
  --color-accent-border: hsl(38 100% 82%);
}
```

```vue
<template>
  <div>
    <orio-button variant="secondary" @click="setTheme('bright-pink')"
      >Bright Pink</orio-button
    >
    <orio-button variant="secondary" @click="setTheme('mint')"
      >Mint</orio-button
    >
    <orio-button variant="secondary" @click="setTheme('amber')"
      >Amber</orio-button
    >
  </div>
</template>

<script setup>
const { setTheme } = useTheme();
</script>
```

### Темний режим

Власні теми автоматично працюють із темним режимом. Бібліотека підлаштовує темний режим через атрибут `data-mode` — вам достатньо задати базові акцентні кольори.

Якщо потрібно окремо налаштувати вигляд теми в темному режимі:

```css
:root[data-mode="dark"][data-theme="sunset"] {
  /* Optional: override specific values for dark mode */
  --color-accent-soft: hsl(16 30% 15%);
  --color-accent-border: hsl(16 40% 25%);
}
```

### Поради щодо створення тем

1. **Використовуйте HSL** — так легше керувати кольорами
2. **Зберігайте достатній контраст** між акцентом і варіантами soft/border
3. **Перевіряйте у світлому й темному режимах**, щоб текст лишався читабельним
4. **Варіанти soft** мають бути дуже світлими (90–97% світлості в HSL для світлого режиму)
5. **Варіанти border** мають бути за інтенсивністю між soft і акцентом (75–85% світлості)
