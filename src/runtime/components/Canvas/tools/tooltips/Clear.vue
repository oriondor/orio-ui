<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Clear</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Remove all nodes from the canvas.
    </orio-view-text>
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
