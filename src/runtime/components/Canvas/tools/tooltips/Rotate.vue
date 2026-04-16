<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Rotate</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Click a node to select, then drag the top circle to rotate.
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
