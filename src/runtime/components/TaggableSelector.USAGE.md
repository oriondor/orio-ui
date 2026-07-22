---
kind: component
category: Form inputs
purpose: searchable creatable multi-select with tag chips, taggable selector, chip picker, create option
short: searchable, creatable multi-select Selector that renders chosen options as tag chips and can emit new tags
invariants: true
---

# TaggableSelector — agent-only invariants

`<orio-taggable-selector>` is a thin wrapper over `<orio-selector>` that
forces `multiple` mode, adds a fuzzy-search input inside the trigger, and
renders the selection as a row of `<orio-tag>` chips. Read
`Selector.USAGE.md` for the underlying contract.

## Invariants

- **Always multi-select.** The internal `<orio-selector>` is passed
  `multiple` unconditionally; the prop cannot be turned off.
- **Two models.** `v-model` is the selected `SelectableOption[]` (default
  `[]`); `v-model:search` is the search string (default `""`). The trigger
  input is bound to `search`; the dropdown list is the fuzzy-filtered
  options, not the raw `options`.
- **`optionName` defaults to `"text"`** (aligns with `TagProps.text`);
  `field` (uniqueness key) defaults to `"id"`. Chips and filtering both
  resolve labels through `optionName`, so `{ id, name }` works with
  `option-name="name"`.
- **Fuzzy keys are fixed at setup.** Object search uses `useFuzzySearch`
  with `keys: [optionName]`, `threshold: 0.3`. **`optionName` must not
  change at runtime** — Fuse is built once.
- **One checkbox per row.** The row checkbox comes from `<orio-list-item>`
  (rendered by Selector because `multiple` sets `selectable`). The `#option`
  slot here renders **only** an `<orio-tag>` — do **not** add a second
  `<orio-check-box>` (that was the historical double-checkbox bug).
- **Trigger is a `<div role="combobox">`, not a button**, so it can legally
  contain the chips + `<input>`. Keydown is forwarded to Selector via the
  `triggerKeydown` slot prop, so arrow/Escape navigation of the list is the
  same as the plain Selector (Enter/Space/typing stay with the input).
- **Opening seeds the highlight.** The input's `@click`/`@input` just call
  `toggle(true)`; the Selector's `toggle` seeds the roving highlight on open
  itself, so the list is keyboard-navigable from the first arrow press with
  no highlight bookkeeping here. Enter then selects the highlighted match; it
  only creates when the search matches nothing.

## Create flow

- **`@create(search: string)`** fires when the user asks to create a new
  option. Payload is the current search text. On fire the search input is
  cleared.
- **Two triggers:** clicking the sticky **"Create …"** button in the
  dropdown, or pressing **Enter while nothing matches** the search
  (`filteredOptions.length === 0`). Enter with visible matches selects the
  highlighted option instead — it never creates over a match.
- **Gate:** `canCreate = allowCreate && search && !exactMatchExists`.
  `allowCreate` is a prop, **default `true`**. Set `:allow-create="false"`
  to hide the button and disable Enter-to-create.
- The parent owns persistence: `@create` does not mutate `options` or the
  selection. Push the new option into both yourself if you want it selected.
- **Empty state** renders `taggableSelector.noMatches` ("No matches found")
  via Selector's `#no-options` slot.

## Gotchas

- **The create button shows even without a `@create` listener** (gating is
  the `allowCreate` prop, not listener presence). If a selector should never
  create, pass `:allow-create="false"`.
- **Tags in the trigger are display-only.** Clicking a chip does **not**
  remove the option; reopen the dropdown and uncheck it. For click-to-remove
  fall back to `<orio-selector>` with a custom `#trigger-label`.
- **`tagVariant` is a single prop** tinting every chip — there is no
  per-option variant.
- **Trigger grows with `flex-wrap`.** Many chips increase trigger height;
  constrain it if your layout needs a fixed height.

## i18n keys

`taggableSelector.placeholder`, `taggableSelector.create` (interpolates
`{search}`), `taggableSelector.noMatches` — all present in `en.json` and
`uk.json`.

## Quick reference

```vue
<script setup lang="ts">
import { ref } from "vue";

interface Skill {
  id: string;
  name: string;
}

const allSkills = ref<Skill[]>([
  { id: "vue", name: "Vue" },
  { id: "nuxt", name: "Nuxt" },
]);
const selected = ref<Skill[]>([]);
const search = ref("");

function createSkill(name: string) {
  const skill = { id: name.toLowerCase(), name };
  allSkills.value.push(skill);
  selected.value.push(skill);
}
</script>

<template>
  <orio-taggable-selector
    v-model="selected"
    v-model:search="search"
    :options="allSkills"
    field="id"
    option-name="name"
    :label="$t('profile.skills')"
    @create="createSkill"
  />
</template>
```

## Related

- `<orio-selector>` — base; use with custom `#trigger-label` for removable
  chips or non-search layouts.
- `<orio-tag>` — the chip primitive rendered in the trigger.
- Public API reference: `docs/components/taggable-selector.md`.
