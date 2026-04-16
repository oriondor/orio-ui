<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Move</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Click and drag to reposition nodes.
    </orio-view-text>
    <orio-view-key-binds bind="`]` bring forward · `[` send backward" />
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
