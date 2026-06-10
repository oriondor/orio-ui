---
kind: component
category: Form inputs
purpose: form wrapper, submission, validation surface, auto-bind form model
short: form wrapper that auto-binds child controls by `name` prop to a single object v-model
invariants: true
---

# Form — agent-only invariants

`<orio-form>` is a form wrapper that walks its slot vnodes and **auto-binds
child controls to a single object v-model** by matching each child's
`name` prop to a key (or dot path) in the model. Generic over `T extends
object`.

## Invariants

- **v-model is an object `T`.** Each child with a `name="..."` prop
  receives `modelValue` and `onUpdate:modelValue` cloned in via
  `cloneVNode`. The user's hand-written v-model on that child is
  overridden if `name` matches a field.
- **Auto-bind requires both `name` and a matching field path.** Children
  without `name`, or with a `name` that doesn't resolve via `getByPath`,
  render unchanged. Auto-bind is silent — no warning when a name doesn't
  match.
- **Dot-paths supported**: `name="user.email"` writes to `model.user.email`.
  The intermediate path must already exist (`setByPath` no-ops if the
  parent is missing).
- **Children must follow the `modelValue` / `update:modelValue` contract.**
  Auto-bind injects these props directly; v-model sugar is not used. Any
  child that doesn't honor that pair is silently un-bound. All orio
  form components do; custom children need to follow the contract.
- **Slot walking is recursive.** Vnode children, slot functions, and slot
  objects are all descended. Wrappers (`<div>` groupers, layout columns)
  are transparent.
- **`disabled` wraps the children in `<fieldset disabled>`** with
  `display: contents` so nothing visual changes. The native `disabled`
  attribute on the fieldset gates every form control inside (browser-
  native behavior).
- **`loading` adds `pointer-events: none`** plus 0.6 opacity on the form.
  Visual + interaction lock without disabling form values.
- **`novalidate` is set on the `<form>`** — HTML5 native validation
  bubbles are off. Pair with `useValidation` for declarative checks.
- **`@submit` emits a single `submit` event** after `preventDefault`. The
  emit is gated by `disabled || loading`. There is **no** built-in submit
  button — render `<orio-button type="submit">` (or similar) inside.

## Gotchas

- **No per-field error wiring.** `error` props on children are still
  user-managed. The Form is only a binder, not a validator.
- **Reactivity through `setByPath` requires mutable nested objects.** A
  frozen / readonly model breaks silently. Use a plain ref'd object.
- **Auto-bind clones the vnode** — keyed lists work, but if a child also
  emits something other than `update:modelValue` via the same `onUpdate`
  pattern, the clone replaces only the listed handlers.
- **Slot is descended into every render** — performance scales linearly
  with slot depth. For very large forms (hundreds of fields), consider
  splitting into nested `<orio-form>`s by section.
- **`name` collisions silently overwrite.** Two children with the same
  `name` both bind to the same field; both updates write to the same
  spot. Order is undefined.

## Quick reference

```vue
<script setup lang="ts">
interface Profile {
  name: string;
  email: string;
  preferences: { newsletter: boolean };
}

const profile = ref<Profile>({
  name: "",
  email: "",
  preferences: { newsletter: false },
});

function save() {
  // Submit profile.value to API
}
</script>

<template>
  <orio-form v-model="profile" :loading="saving" @submit="save">
    <orio-input name="name" :label="$t('profile.name')" />
    <orio-input name="email" :label="$t('profile.email')" type="email" />
    <orio-check-box name="preferences.newsletter">
      {{ $t("profile.newsletter") }}
    </orio-check-box>

    <orio-button type="submit">{{ $t("common.save") }}</orio-button>
  </orio-form>
</template>
```

## Related

- `useValidation` — declarative validation rules for form fields.
- `<orio-control-element>` — wraps every form input with label/error.
- Public API reference: `docs/components/form.md`.
