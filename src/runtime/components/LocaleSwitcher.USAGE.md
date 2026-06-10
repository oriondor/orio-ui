---
kind: component
category: Media & misc
purpose: locale switcher, language toggle, i18n switcher
short: preconfigured Selector that mutates vue-i18n's locale; defaults to English + Ukrainian with flag emojis
invariants: true
---

# LocaleSwitcher — agent-only invariants

`<orio-locale-switcher>` is a thin wrapper around `<orio-selector>` that
reads and writes `useI18n().locale` directly. Drop it anywhere in the app
to give users a language toggle.

## Invariants

- **Mutates `useI18n().locale` on selection.** No model is exposed —
  the side effect is the API.
- **Default `locales`**:
  ```ts
  [
    { code: "en", flag: "🇬🇧", label: "English" },
    { code: "uk", flag: "🇺🇦", label: "Українська" },
  ]
  ```
  Override with the `locales` prop if your app supports a different set.
- **`LocaleOption` shape** (exported): `{ code, flag, label }`. All three
  are strings; `flag` is rendered verbatim (emoji or any unicode).
- **Selector wiring**: `field: "code"`, `optionName: "label"`. Active
  option matches by `code === currentLocale`. Falls back to the first
  locale if the current i18n locale isn't in the list.
- **Custom `#trigger-label` and `#option` slots** render `flag + label`
  side-by-side with 0.5rem gap.
- **Requires `useI18n` setup.** The component throws if called outside
  a vue-i18n context.

## Gotchas

- **Direct locale mutation bypasses any persistence layer.** If your
  app saves locale to cookies / localStorage / API, hook into
  `useI18n().locale` from elsewhere — this component does not call
  any side effect beyond the i18n update.
- **Flag emojis depend on font support.** macOS / iOS render them
  correctly; Windows often shows letter pairs (e.g. "GB", "UA"). For
  cross-platform consistency, swap to icons via a custom `locales`
  prop with icon names + a custom `#option`/`#trigger-label`.
- **No client/server hydration story.** If the locale is mutated
  before vue-i18n is hydrated on the client, mismatches can occur.
  Best to initialize locale in your app setup and let this switcher
  only handle user-driven changes.

## Quick reference

```vue
<template>
  <orio-locale-switcher />

  <orio-locale-switcher
    :locales="[
      { code: 'en', flag: '🇺🇸', label: 'English' },
      { code: 'es', flag: '🇪🇸', label: 'Español' },
      { code: 'pt', flag: '🇧🇷', label: 'Português' },
    ]"
  />
</template>
```

## Related

- `<orio-selector>` — under the hood. Build your own switcher from
  Selector if you need different side effects (e.g. routing).
- Public API reference: `docs/components/locale-switcher.md` (if
  present).
