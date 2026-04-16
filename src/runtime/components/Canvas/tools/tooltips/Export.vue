<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Export</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Download the canvas as PNG, JPEG, or WebP. Configure format and filename
      via the tool's options.
    </orio-view-text>
  </div>
</template>

<style scoped>
.tool-tip {
  --view-text-color: white;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 240px;
  white-space: normal;
}
</style>
