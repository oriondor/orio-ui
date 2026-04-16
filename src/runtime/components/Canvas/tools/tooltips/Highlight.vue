<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Highlight</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Hover over nodes to inspect their bounding box.
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
