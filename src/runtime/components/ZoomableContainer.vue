<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, useTemplateRef } from "vue";
import { useResizeObserver } from "@vueuse/core";

export interface ZoomableContainerProps {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  zoomSpeed?: number;
  wheelPanSpeed?: number;
}

const props = withDefaults(defineProps<ZoomableContainerProps>(), {
  minScale: 0.1,
  maxScale: 10,
  initialScale: 1,
  zoomSpeed: 0.0015,
  wheelPanSpeed: 1,
});

const emit = defineEmits<{
  (e: "update:scale", value: number): void;
  (e: "update:translate", x: number, y: number): void;
}>();

const viewportEl = useTemplateRef<HTMLDivElement>("viewportEl");
const worldEl = useTemplateRef<HTMLDivElement>("worldEl");

const scale = ref(props.initialScale);
const tx = ref(0);
const ty = ref(0);

const viewport = ref({ w: 0, h: 0 });
const world = ref({ w: 0, h: 0 });
const spaceHeld = ref(false);
let centered = false;

function clamp(v: number, a: number, b: number) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return Math.max(lo, Math.min(hi, v));
}

function applyBounds() {
  const vw = viewport.value.w;
  const vh = viewport.value.h;
  const ww = world.value.w * scale.value;
  const wh = world.value.h * scale.value;
  tx.value = clamp(tx.value, vw / 2 - ww, vw / 2);
  ty.value = clamp(ty.value, vh / 2 - wh, vh / 2);
}

function emitState() {
  emit("update:scale", scale.value);
  emit("update:translate", tx.value, ty.value);
}

function setScaleAt(target: number, px: number, py: number) {
  const next = clamp(target, props.minScale, props.maxScale);
  const k = next / scale.value;
  tx.value = px - (px - tx.value) * k;
  ty.value = py - (py - ty.value) * k;
  scale.value = next;
  applyBounds();
  emitState();
}

function panBy(dx: number, dy: number) {
  tx.value += dx;
  ty.value += dy;
  applyBounds();
  emitState();
}

function centerWorld() {
  const { w: vw, h: vh } = viewport.value;
  const { w: ww, h: wh } = world.value;
  tx.value = (vw - ww * scale.value) / 2;
  ty.value = (vh - wh * scale.value) / 2;
  applyBounds();
  emitState();
}

function resetView() {
  scale.value = props.initialScale;
  centerWorld();
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) {
    const rect = viewportEl.value!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * props.zoomSpeed);
    setScaleAt(scale.value * factor, px, py);
    return;
  }
  let dx = -e.deltaX * props.wheelPanSpeed;
  let dy = -e.deltaY * props.wheelPanSpeed;
  if (e.shiftKey && dx === 0) {
    dx = dy;
    dy = 0;
  }
  panBy(dx, dy);
}

let dragId: number | null = null;
let lastX = 0;
let lastY = 0;

// Multi-touch state for pinch-to-zoom
const activePointers = new Map<number, { x: number; y: number }>();

function pointerDistance() {
  const pts = [...activePointers.values()];
  if (pts.length < 2) return 0;
  const dx = pts[1].x - pts[0].x;
  const dy = pts[1].y - pts[0].y;
  return Math.hypot(dx, dy);
}

function pointerMidpoint() {
  const pts = [...activePointers.values()];
  if (pts.length < 2) return { x: 0, y: 0 };
  return {
    x: (pts[0].x + pts[1].x) / 2,
    y: (pts[0].y + pts[1].y) / 2,
  };
}

let pinchStartDist = 0;
let pinchStartScale = 1;
let pinchLastMid = { x: 0, y: 0 };

function shouldPan(e: PointerEvent) {
  if (e.button === 1) return true;
  if (spaceHeld.value) return true;
  if (e.target === viewportEl.value) return true;
  return false;
}

function onPointerDown(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement;

  // Track touch pointers for pinch gesture
  if (e.pointerType === "touch") {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    el.setPointerCapture(e.pointerId);

    if (activePointers.size === 2) {
      // Start pinch — cancel any single-finger drag
      dragId = null;
      pinchStartDist = pointerDistance();
      pinchStartScale = scale.value;
      pinchLastMid = pointerMidpoint();
      return;
    }

    if (activePointers.size === 1) {
      // Single touch — treat as pan
      e.preventDefault();
      dragId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }

    // 3+ fingers — ignore
    return;
  }

  // Mouse / pen — original behavior
  if (!shouldPan(e)) return;
  e.preventDefault();
  dragId = e.pointerId;
  lastX = e.clientX;
  lastY = e.clientY;
  el.setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  // Update tracked pointer position
  if (activePointers.has(e.pointerId)) {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  // Pinch-to-zoom + two-finger pan
  if (activePointers.size === 2 && e.pointerType === "touch") {
    const dist = pointerDistance();
    const mid = pointerMidpoint();
    const rect = viewportEl.value!.getBoundingClientRect();

    // Zoom at midpoint
    if (pinchStartDist > 0) {
      const newScale = pinchStartScale * (dist / pinchStartDist);
      const px = mid.x - rect.left;
      const py = mid.y - rect.top;
      setScaleAt(newScale, px, py);
    }

    // Pan by midpoint delta
    const dx = mid.x - pinchLastMid.x;
    const dy = mid.y - pinchLastMid.y;
    if (dx !== 0 || dy !== 0) panBy(dx, dy);

    pinchLastMid = mid;
    return;
  }

  // Single-pointer drag
  if (dragId !== e.pointerId) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  panBy(dx, dy);
}

function onPointerUp(e: PointerEvent) {
  activePointers.delete(e.pointerId);

  // If returning from pinch to single finger, reset single-drag state
  if (activePointers.size === 1 && e.pointerType === "touch") {
    const [id, pt] = [...activePointers.entries()][0];
    dragId = id;
    lastX = pt.x;
    lastY = pt.y;
    pinchStartDist = 0;
    return;
  }

  if (activePointers.size === 0) {
    pinchStartDist = 0;
  }

  if (dragId !== e.pointerId) return;
  dragId = null;
  try {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {
    // Pointer may already be released.
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.code === "Space") spaceHeld.value = true;
}
function onKeyUp(e: KeyboardEvent) {
  if (e.code === "Space") spaceHeld.value = false;
}

useResizeObserver(viewportEl, (entries) => {
  const r = entries[0].contentRect;
  viewport.value = { w: r.width, h: r.height };
  if (!centered && world.value.w && world.value.h) {
    centered = true;
    centerWorld();
  } else {
    applyBounds();
  }
});

useResizeObserver(worldEl, (entries) => {
  const r = entries[0].contentRect;
  world.value = { w: r.width, h: r.height };
  if (!centered && viewport.value.w && viewport.value.h) {
    centered = true;
    centerWorld();
  } else {
    applyBounds();
  }
});

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  const vEl = viewportEl.value;
  const wEl = worldEl.value;
  if (!vEl || !wEl) return;
  viewport.value = { w: vEl.clientWidth, h: vEl.clientHeight };
  world.value = { w: wEl.offsetWidth, h: wEl.offsetHeight };
  if (viewport.value.w && world.value.w) {
    centered = true;
    centerWorld();
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
});

const transform = computed(
  () => `translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
);

const cursor = computed(() => {
  if (dragId !== null) return "grabbing";
  if (spaceHeld.value) return "grab";
  return "default";
});

defineExpose({
  scale,
  tx,
  ty,
  setScaleAt,
  panBy,
  resetView,
  centerWorld,
});
</script>

<template>
  <div
    ref="viewportEl"
    class="zoomable-viewport"
    :style="{ cursor }"
    @wheel="onWheel"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @contextmenu.prevent
  >
    <div ref="worldEl" class="zoomable-world" :style="{ transform }">
      <slot :scale="scale" :tx="tx" :ty="ty" />
    </div>
  </div>
</template>

<style scoped>
.zoomable-viewport {
  position: relative;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  width: 100%;
  height: 100%;
}

.zoomable-world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}
</style>
