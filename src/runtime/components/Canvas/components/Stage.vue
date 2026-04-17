<script setup lang="ts">
import { computed, onMounted, onUnmounted, useTemplateRef, watch } from "vue";
import { useEventListener } from "@vueuse/core";
import { useCanvasContext } from "../context";
import { getNodeBounds } from "../tools/hitTest";
import type { CanvasPointerEvent, CanvasTool } from "../types";

const ctx = useCanvasContext();

const rootEl = useTemplateRef<HTMLDivElement>("rootEl");
const canvasEl = useTemplateRef<HTMLCanvasElement>("canvasEl");

let renderQueued = false;
let rafId = 0;

function render() {
  renderQueued = false;
  const canvas = canvasEl.value;
  if (!canvas) return;
  const c = canvas.getContext("2d");
  if (!c) return;

  const dpr = window.devicePixelRatio || 1;
  const { width, height } = ctx.size.value;
  const pxW = Math.round(width * dpr);
  const pxH = Math.round(height * dpr);
  if (canvas.width !== pxW || canvas.height !== pxH) {
    canvas.width = pxW;
    canvas.height = pxH;
  }

  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, width, height);

  const toolMap = new Map<string, CanvasTool>(
    ctx.tools.value.map((t) => [t.id, t]),
  );
  const ordered = [...ctx.nodes.value].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
  );
  for (const node of ordered) {
    const renderFn = toolMap.get(node.type)?.render;
    if (!renderFn) continue;
    if (node.rotation) {
      const b = getNodeBounds(node);
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      c.save();
      c.translate(cx, cy);
      c.rotate(node.rotation);
      c.translate(-cx, -cy);
      renderFn(c, node);
      c.restore();
    } else {
      renderFn(c, node);
    }
  }

  // Render overlay for the active tool (e.g. highlight bounding rect).
  const active = ctx.tools.value.find((t) => t.id === ctx.activeToolId.value);
  if (active?.renderOverlay) {
    active.renderOverlay(c, ctx.getToolApi(active.id));
  }
}

function requestRender() {
  if (renderQueued) return;
  renderQueued = true;
  rafId = requestAnimationFrame(render);
}

ctx.installRenderer(requestRender);

useEventListener(rootEl, "keydown", ctx.onKeyDown);

onMounted(() => {
  ctx.stageEl.value = rootEl.value;
  requestRender();
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  if (ctx.stageEl.value === rootEl.value) {
    ctx.stageEl.value = null;
  }
});

watch(
  () => ctx.nodes.value,
  () => requestRender(),
  { deep: true },
);
watch(() => ctx.size.value, requestRender, { deep: true });

const activeTool = computed(() =>
  ctx.tools.value.find((t) => t.id === ctx.activeToolId.value),
);

const cursor = computed(
  () => ctx.cursorOverride.value ?? activeTool.value?.cursor ?? "default",
);

function toCanvasEvent(e: PointerEvent): CanvasPointerEvent {
  const rect = (rootEl.value as HTMLElement).getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    clientX: e.clientX,
    clientY: e.clientY,
    buttons: e.buttons,
    originalEvent: e,
  };
}

function onPointerDown(e: PointerEvent) {
  rootEl.value?.focus();
  const tool = activeTool.value;
  if (!tool) return;
  ctx.beginAction();
  try {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  } catch {
    // setPointerCapture can throw if the pointer is no longer active.
  }
  tool.onPointerDown?.(toCanvasEvent(e), ctx.getToolApi(tool.id));
}

function onPointerMove(e: PointerEvent) {
  const tool = activeTool.value;
  if (!tool) return;
  tool.onPointerMove?.(toCanvasEvent(e), ctx.getToolApi(tool.id));
}

function onPointerUp(e: PointerEvent) {
  const tool = activeTool.value;
  if (!tool) return;
  tool.onPointerUp?.(toCanvasEvent(e), ctx.getToolApi(tool.id));
  ctx.endAction();
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {
    // Ignore — pointer may already have been released.
  }
}
</script>

<template>
  <div
    ref="rootEl"
    class="canvas-stage"
    tabindex="0"
    :style="{
      width: ctx.size.value.width + 'px',
      height: ctx.size.value.height + 'px',
      cursor,
    }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <canvas
      ref="canvasEl"
      :style="{
        width: ctx.size.value.width + 'px',
        height: ctx.size.value.height + 'px',
      }"
    />
  </div>
</template>

<style scoped>
.canvas-stage {
  position: relative;
  touch-action: none;
  user-select: none;
  outline: none;
}

.canvas-stage > canvas {
  display: block;
}
</style>
