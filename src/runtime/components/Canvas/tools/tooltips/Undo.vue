<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Undo</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Revert the last action.
    </orio-view-text>
    <orio-view-key-binds bind="`Ctrl`/`Cmd` + `Z`" />
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
