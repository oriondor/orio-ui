<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Eraser</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Drag over elements to remove them. Frozen nodes are protected.
    </orio-view-text>
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
