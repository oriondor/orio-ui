<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useCanvasContext } from "../context";
import ToolButton from "./ToolButton.vue";

const { t } = useI18n();
const ctx = useCanvasContext();
</script>

<template>
  <div
    class="canvas-toolbar"
    role="toolbar"
    :aria-label="t('canvas.toolbarLabel')"
  >
    <slot
      :tools="ctx.tools.value"
      :active-tool-id="ctx.activeToolId.value"
      :set-active-tool="ctx.setActiveTool"
    >
      <ToolButton v-for="tool in ctx.tools.value" :key="tool.id" :tool />
    </slot>
  </div>
</template>

<style scoped>
.canvas-toolbar {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
}
</style>
