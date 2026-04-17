<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Transform</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Click a node to select. Drag corners to resize, the top circle to rotate,
      or the body to move.
    </orio-view-text>
    <orio-view-key-binds bind="`Esc` deselect" />
  </div>
</template>

<style scoped>
.tool-tip {
  --view-text-color: white;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 220px;
  white-space: normal;
}
</style>
