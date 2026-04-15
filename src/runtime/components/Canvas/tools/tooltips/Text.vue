<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">Text</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Click anywhere to place text.
    </orio-view-text>
    <orio-view-key-binds bind="`Enter` commit · `Esc` cancel" />
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
