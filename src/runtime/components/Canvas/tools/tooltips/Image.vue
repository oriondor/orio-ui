<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Upload image</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Insert a PNG, JPEG, WebP, GIF, SVG, AVIF, or BMP file. Resize and rotate
      with the Transform tool.
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
