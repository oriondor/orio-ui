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
  **append** to it; the array is then sliced to `maxFiles` if set.
- **`maxFiles`**:
  - `undefined` (default) → unlimited.
  - `> 1` → multi-select mode (drop & dialog).
  - `1` → single-file mode; new selections replace the array (capped to
    length 1 by the slice).
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
  drop / dialog truncates them.
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

  <ul>
    <li v-for="(file, index) in files" :key="index">{{ file.name }}</li>
  </ul>
</template>
```

## Related

- `<orio-dashed-container>` — common UI shell for upload tiles.
- Public API reference: `docs/components/upload.md` (if present).
