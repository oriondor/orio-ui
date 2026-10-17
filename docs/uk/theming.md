# Теми

Orio UI використовує багатошарову систему CSS-змінних для гнучкого налаштування тем зі світлим і темним режимами.

## Швидка зміна теми

Перемикайте теми за допомогою композабла `useTheme`:

```vue
<script setup>
const { theme, setTheme, mode, setMode } = useTheme()

// Change accent theme
setTheme('navy')  // navy | teal | forest | wine | royal | violet | normal | inverse

// Change color mode
setMode('light')   // light | dark (default)
</script>
```

## Готові перемикачі

Два преконфігуровані компоненти обгортають `useTheme`, тож перемикач можна вставити в будь-яку панель без підключення `v-model`:

```vue
<template>
  <!-- accent theme picker (navy | teal | forest | wine | royal | violet) -->
  <orio-theme-switcher />

  <!-- light / dark toggle with localized labels -->
  <orio-mode-switcher />
</template>
```

Обидва змінюють `useTheme` під час вибору й зберігають значення в cookies. Пропси та поведінку описано на сторінках [ThemeSwitcher](./components/theme-switcher.md) і [ModeSwitcher](./components/mode-switcher.md).

Доступні значення також експортуються як константи — зручно для власних перемикачів:

```typescript
import { THEMES, MODES } from 'orio-ui'

THEMES // ['navy', 'teal', 'forest', 'wine', 'royal', 'violet']
MODES  // ['light', 'dark']
```

`<orio-theme-switcher>` за замовчуванням використовує `THEMES`; передайте проп `themes`, щоб додати власні акценти, як-от `normal`, `inverse` чи свої.

## Як це працює

Налаштування теми зберігаються в **cookies** (`orio-theme` і `orio-mode`) для сумісності з SSR. Композабл встановлює атрибути `data-theme` і `data-mode` на елементі `<html>`, за якими CSS застосовує потрібні змінні.

## Система CSS-змінних

### Шар 1: базові змінні (`:root`)

Вони задають основу й доступні завжди:

```css
/* Background & Surface */
--color-bg          /* Page background */
--color-surface     /* Elevated surfaces (cards, modals) */

/* Text */
--color-text        /* Primary text */
--color-muted       /* Secondary/muted text */

/* Border */
--color-border      /* Default border color */

/* Accent family */
--color-accent          /* Primary accent color */
--color-accent-ink      /* Text on accent backgrounds */
--color-accent-soft     /* Subtle accent background */
--color-accent-soft-darker
--color-accent-border   /* Accent-tinted border */
--color-accent-hover    /* Accent hover state */
--color-accent-active   /* Accent active/pressed state */

/* Semantic colors */
--color-danger          /* Error/destructive actions */
--color-danger-ink
--color-danger-soft
--color-danger-border

--color-alert           /* Warnings */
--color-alert-ink
--color-alert-soft
--color-alert-border

--color-success         /* Success states */
--color-success-ink
--color-success-soft
--color-success-border

--color-info            /* Informational */
--color-info-ink
--color-info-soft
--color-info-border
```

### Шар 2: змінні режиму (`data-mode`)

Керують світлим/темним виглядом. Встановлюються через `data-mode="light|dark"` на `<html>`:

```css
[data-mode="light"] {
  --color-bg: #ffffff;
  --color-surface: #f7f8fa;
  --color-text: #0e1116;
  --color-muted: #626a78;
  --color-border: #bfbfc2;
}

[data-mode="dark"] {
  --color-bg: #0e1116;
  --color-surface: #1a1d23;
  --color-text: #ffffff;
  --color-muted: #a2a9b6;
  --color-border: #2e333d;

  /* Dark mode also adjusts accent derivatives */
  --color-accent-soft-base: color-mix(in srgb, var(--color-accent) 12%, #0e1116);
  --color-accent-hover: color-mix(in srgb, var(--color-accent) 30%, white 70%);
  /* ... */
}
```

### Шар 3: акцентні теми (`data-theme`)

Керують акцентним кольором. Встановлюються через `data-theme="themename"` на `<html>`:

```css
[data-theme="navy"] {
  --color-accent: hsl(219, 45%, 56%);
}

[data-theme="teal"] {
  --color-accent: hsl(174, 65%, 44%);
}

[data-theme="forest"] {
  --color-accent: hsl(153, 35%, 53%);
}

[data-theme="wine"] {
  --color-accent: hsl(350, 55%, 34%);
}

[data-theme="royal"] {
  --color-accent: hsl(230, 60%, 40%);
}

[data-theme="violet"] {
  --color-accent: hsl(258, 85%, 62%);
}

[data-theme="normal"] {
  --color-accent: #ced1d5;
  --color-accent-ink: #2a2a2b;
}

[data-theme="inverse"] {
  /* Flips to black/white based on mode */
}
```

## Вбудовані теми

| Тема | Колір | Опис |
|-------|-------|-------------|
| **navy** (за замовчуванням) | `hsl(219, 45%, 56%)` | Діловий синій |
| **teal** | `hsl(174, 65%, 44%)` | Свіжий бірюзовий |
| **forest** | `hsl(153, 35%, 53%)` | Природний зелений |
| **wine** | `hsl(350, 55%, 34%)` | Глибокий бордовий |
| **royal** | `hsl(230, 60%, 40%)` | Насичений пурпурно-синій |
| **violet** | `hsl(258, 85%, 62%)` | Яскравий електричний фіолетовий |
| **normal** | `#ced1d5` | Нейтральний сірий |
| **inverse** | чорний/білий | Високий контраст, підлаштовується під режим |

## Створення власних тем

### Спосіб 1: додати нову акцентну тему

Створіть CSS-файл зі своєю темою:

```css
/* assets/css/my-themes.css */

[data-theme="coral"] {
  --color-accent: hsl(16, 100%, 66%);
}

[data-theme="lavender"] {
  --color-accent: hsl(270, 60%, 70%);
}
```

Підключіть його в `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['orio-ui'],
  css: ['~/assets/css/my-themes.css']
})
```

Використовуйте:

```vue
<script setup>
const { setTheme } = useTheme()
setTheme('coral')
</script>
```

### Спосіб 2: перевизначити похідні акценту

Для повного контролю перевизначте похідні акцентні змінні:

```css
[data-theme="brand"] {
  --color-accent: #ff6b00;
  --color-accent-ink: #ffffff;
  --color-accent-soft: color-mix(in srgb, var(--color-accent) 15%, #e3e3e3);
  --color-accent-border: color-mix(in srgb, var(--color-accent) 40%, #fde68a);
  --color-accent-hover: color-mix(in srgb, var(--color-accent) 85%, black 15%);
  --color-accent-active: color-mix(in srgb, var(--color-accent), black 60%);
}

/* Dark mode overrides for your theme */
[data-theme="brand"][data-mode="dark"] {
  --color-accent-soft: color-mix(in srgb, var(--color-accent) 12%, #0e1116);
  --color-accent-border: color-mix(in srgb, var(--color-accent) 40%, #0e1116);
  --color-accent-hover: color-mix(in srgb, var(--color-accent) 30%, white 70%);
}
```

### Спосіб 3: перевизначити базові кольори

Щоб змінити загальний вигляд, а не лише акценти:

```css
/* Custom dark background */
[data-mode="dark"] {
  --color-bg: #1a1a2e;
  --color-surface: #16213e;
}

/* Custom light background */
[data-mode="light"] {
  --color-bg: #fafafa;
  --color-surface: #ffffff;
}
```

## Успадкування змінних

Система за допомогою `color-mix()` автоматично виводить споріднені кольори з `--color-accent`:

```css
/* These are computed automatically when you set --color-accent */
--color-accent-soft: color-mix(in srgb, var(--color-accent) 15%, #e3e3e3);
--color-accent-border: color-mix(in srgb, var(--color-accent) 40%, #c7d2fe);
--color-accent-hover: color-mix(in srgb, var(--color-accent) 85%, black 15%);
--color-accent-active: color-mix(in srgb, var(--color-accent), black 60%);
```

Тож для більшості власних тем достатньо задати `--color-accent`, а решта обчислиться сама.

## Збереження

Налаштування теми зберігаються в **cookies**:
- `orio-theme` — назва акцентної теми
- `orio-mode` — світлий/темний режим

Cookies використовуються замість localStorage заради сумісності з SSR: сервер читає cookies і одразу рендерить правильну тему, тож немає спалаху неправильної теми під час першого завантаження.

## Повний довідник змінних

Повну реалізацію див. у [`src/runtime/assets/css/colors.css`](https://github.com/oriondor/orio-ui/blob/main/src/runtime/assets/css/colors.css).
