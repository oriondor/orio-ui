---
kind: component
category: Media & misc
purpose: upload, file picker, drop-to-upload, file input, headless file upload
short: headless file upload — provides drop-zone state and file-dialog opener via slot props; consumer renders the UI
invariants: true
---

# upload — agent-only invariants

`<orio-upload>` is a **headless** file-upload component. It owns drag-drop
detection and file-dialog opening; the consumer renders all UI through the
default slot. There is no built-in look.

## Invariants

- **Template is essentially `<div><slot :is-over-drop-zone :open-dialog /></div>`.**
  No styling, no built-in drop hint, no preview list.
- **Slot props**:
  - `isOverDropZone: boolean` — true while a dragged file is over the
    zone (and the component is not disabled).
  - `openDialog: () => void` — opens the native file picker.
- **v-model is `File[]`** (default `[]`). Drops and dialog selections
  **append** to it, then the array is trimmed to `maxFiles` **from the
  front** (`merged.slice(-maxFiles)`) — the newest picks always survive
  and the oldest files shift out. An unset `maxFiles` keeps everything
  (do not reintroduce `slice(0, maxFiles ?? -1)`, which silently dropped
  the last file of every append).
- **`maxFiles`**:
  - `undefined` (default) → unlimited.
  - `> 1` → multi-select mode (drop & dialog). 4 files in the model,
    `maxFiles: 5`, 4 more picked → the model holds the last of the old
    four plus all four new ones.
  - `1` → the shift rule reduces to plain replacement: each pick becomes
    the model. Drop and dialog also run in single-select mode.
- **File count** is just `modelValue.length` — there is no separate
  count slot prop or emit. Consumers render it themselves
  (`{{ files.length }} file(s) selected`).
- **`allowedTypes`** is forwarded as `dataTypes` to `useDropZone`
  (drop filter) and as `accept` (comma-joined) to the native dialog.
  Be explicit — passing MIME-type strings (`"image/png"`) vs.
  extensions (`".png"`) is the consumer's choice.
- **`disabled`** blocks both drop and `openDialog` calls. `isOverDropZone`
  is also forced `false` while disabled so the slot UI doesn't flash an
  "active" state during a no-op.
- **The whole template div is the drop zone.** The slot content sits
  inside it; the consumer's hit area equals whatever they render.

## Gotchas

- **No UI at all by default.** A bare `<orio-upload v-model="files" />`
  renders an empty `<div>` — clicking does nothing. You must provide a
  default slot that calls `openDialog`.
- **Drops append**, including duplicates. Same-named files are added
  again; dedupe in the consumer if needed.
- **`maxFiles` only enforces on append**. If the model is pre-populated
  with more files than `maxFiles`, they stick around until the next
  drop / dialog trims them.
- **Overflowing `maxFiles` drops the oldest files silently.** There is
  no emit or warning when files shift out — surface the count
  (`files.length`) in the slot UI if that matters.
- **`useFileDialog` uses native input.** It's not styleable. The "dialog"
  is the OS chooser; styling lives on the trigger element you render in
  the slot.
- **No progress / upload semantics.** This component only collects File
  objects. Uploading them to a server is the consumer's job.
- **`accept` attribute on the dialog vs. drop filter divergence**: the
  drop filter is enforced by browser drag-drop semantics; the dialog's
  `accept` is a hint, not a hard filter — users can choose any file via
  the chooser depending on OS.

## Quick reference

```vue
<script setup lang="ts">
const files = ref<File[]>([]);
</script>

<template>
  <orio-upload
    v-model="files"
    :max-files="5"
    :allowed-types="['image/png', 'image/jpeg']"
  >
    <template #default="{ isOverDropZone, openDialog }">
      <orio-dashed-container
        :icon="isOverDropZone ? 'drop' : 'upload'"
        :text="$t(isOverDropZone ? 'upload.drop' : 'upload.choose')"
        @click="openDialog"
      />
    </template>
  </orio-upload>

  <p>{{ files.length }} file(s) selected</p>
</template>
```

## Related

- `<orio-dashed-container>` — common UI shell for upload tiles.
- Public API reference: `docs/components/upload/upload.md`.
