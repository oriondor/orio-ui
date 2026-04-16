<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Redo</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Restore the last undone action.
    </orio-view-text>
    <orio-view-key-binds bind="`Ctrl`/`Cmd` + `Shift` + `Z`" />
  </div>
</template>

<style scoped>
.tool-tip {
  --view-text-color: white;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 200px;
  white-space: normal;
}
</style>
