# ModeSwitcher

Преконфігурований [`Selector`](./selector.md), що перемикає світлий/темний колірний режим через [`useTheme`](../composables/use-theme.md). Вибір опції змінює `data-mode` на `<html>` і зберігає значення в cookie `orio-mode`. Підписи опцій беруться з vue-i18n (`modeSwitcher.light` / `modeSwitcher.dark`), тож відповідають активній локалі.

## Живе демо

<div class="demo-container">
  <orio-mode-switcher />
</div>

## Використання

```vue
<template>
  <orio-mode-switcher />
</template>
```

Режими зафіксовані експортованою константою `MODES` (`light`, `dark`). Щоб змінити видимі підписи, перевизначте ключі `modeSwitcher.light` / `modeSwitcher.dark` у своїх i18n-повідомленнях.

## Поведінка

- **Змінює `useTheme().mode` під час вибору.** Побічний ефект і є API — `v-model` немає.
- Якщо поточного режиму немає в списку, повертається до режиму за замовчуванням (`dark`), а потім до першої опції.
- Під час монтування виправляє некоректний збережений режим — запасне значення записується назад, тож тригер, cookie та `data-mode` залишаються синхронними.
- Зберігає значення в cookie `orio-mode` для безпечного з погляду SSR першого рендеру.
- Потребує контексту `useTheme` і контексту vue-i18n.

## Типи

```typescript
interface ModeOption {
  code: string; // "light" | "dark"
  label: string; // localized display label
}
```

## Пов'язане

- [`ThemeSwitcher`](./theme-switcher.md) — аналог для акцентної теми.
- [`useTheme`](../composables/use-theme.md) — базовий аксесор.
- [Теми](../theming.md) — як режими відображаються на CSS-змінні.
