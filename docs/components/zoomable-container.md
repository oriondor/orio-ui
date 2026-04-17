# ZoomableContainer

Figma-style pannable and zoomable viewport. Drop any element inside and navigate
it with gestures. Reserves half-viewport padding around content so you can scroll
past its edges.

## Gestures

| Input               | Action              |
| ------------------- | ------------------- |
| Scroll / 2-finger   | Pan                 |
| Shift + scroll      | Pan horizontally    |
| Ctrl/Cmd + scroll   | Zoom at cursor      |
| Trackpad pinch      | Zoom at cursor      |
| Middle-button drag  | Pan anywhere        |
| Space + drag        | Pan anywhere        |
| Drag on background  | Pan                 |

## Live Demo — Custom Divs

<script setup>
import { ref, useTemplateRef } from 'vue'

const container = useTemplateRef('container')

function zoomIn() {
  const el = container.value?.$el ?? container.value
  const rect = el.getBoundingClientRect()
  container.value?.setScaleAt(container.value.scale * 1.2, rect.width / 2, rect.height / 2)
}
function zoomOut() {
  const el = container.value?.$el ?? container.value
  const rect = el.getBoundingClientRect()
  container.value?.setScaleAt(container.value.scale / 1.2, rect.width / 2, rect.height / 2)
}
function reset() {
  container.value?.resetView()
}

const boxes = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i % 5) * 220 + 40,
  y: Math.floor(i / 5) * 220 + 40,
  hue: (i * 37) % 360,
}))

// Canvas demo
const canvasEl = ref(null)
function onCanvasMounted(el) {
  if (!el) return
  canvasEl.value = el
  const c = el.getContext('2d')
  const w = el.width
  const h = el.height
  // Gradient background
  const g = c.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#1e3a8a')
  g.addColorStop(1, '#9333ea')
  c.fillStyle = g
  c.fillRect(0, 0, w, h)
  // Random circles
  for (let i = 0; i < 60; i++) {
    c.beginPath()
    c.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 40, 0, Math.PI * 2)
    c.fillStyle = `hsla(${Math.random() * 360}, 80%, 70%, 0.6)`
    c.fill()
  }
  // Grid lines
  c.strokeStyle = 'rgba(255,255,255,0.2)'
  c.lineWidth = 1
  for (let x = 0; x < w; x += 80) {
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke()
  }
  for (let y = 0; y < h; y += 80) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke()
  }
}
</script>

<style>
.zc-demo {
  width: 100%;
  height: 500px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  overflow: hidden;
}
.zc-toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.zc-board {
  position: relative;
  width: 1200px;
  height: 1000px;
  background:
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15), transparent 40%),
    var(--vp-c-bg);
  border: 1px dashed var(--vp-c-border);
}
.zc-box {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 2rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  user-select: none;
}
.zc-gallery {
  display: grid;
  grid-template-columns: repeat(3, 320px);
  gap: 1rem;
  padding: 1rem;
}
.zc-gallery img {
  width: 320px;
  height: 320px;
  object-fit: cover;
  border-radius: 12px;
  display: block;
}
.zc-hint {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.25rem;
}
</style>

<div class="zc-toolbar">
  <orio-button size="small" @click="zoomIn">Zoom In</orio-button>
  <orio-button size="small" @click="zoomOut">Zoom Out</orio-button>
  <orio-button size="small" @click="reset">Reset</orio-button>
</div>
<div class="zc-hint">Scroll to pan, Ctrl/Cmd+scroll (or pinch) to zoom, Space+drag or middle-mouse to grab.</div>

<div class="zc-demo">
  <orio-zoomable-container ref="container" :min-scale="0.2" :max-scale="4">
    <div class="zc-board">
      <div
        v-for="b in boxes"
        :key="b.id"
        class="zc-box"
        :style="{
          left: b.x + 'px',
          top: b.y + 'px',
          background: `hsl(${b.hue}, 70%, 55%)`
        }"
      >
        {{ b.id }}
      </div>
    </div>
  </orio-zoomable-container>
</div>

## Images

<div class="zc-demo">
  <orio-zoomable-container :min-scale="0.3" :max-scale="6">
    <div class="zc-gallery">
      <img src="/samples/horizontal-sized-photo.png" alt="horizontal" />
      <img src="/samples/square-sized-photo.png" alt="square" />
      <img src="/samples/mobile-sized-photo.png" alt="mobile" />
      <img src="/samples/ball.png" alt="ball" />
      <img src="/samples/horizontal-sized-photo.png" alt="horizontal" />
      <img src="/samples/square-sized-photo.png" alt="square" />
    </div>
  </orio-zoomable-container>
</div>

## Canvas Inside

A `<canvas>` child works like any other element — the browser scales its bitmap.
For pixel-perfect rendering at any zoom, re-render the canvas on scale changes.

<div class="zc-demo">
  <orio-zoomable-container :min-scale="0.25" :max-scale="8">
    <canvas
      :ref="onCanvasMounted"
      width="1200"
      height="800"
      style="display: block;"
    />
  </orio-zoomable-container>
</div>

## Usage

### Basic

```vue
<template>
  <orio-zoomable-container style="width: 100%; height: 600px;">
    <div style="width: 2000px; height: 1500px;">
      <!-- any content -->
    </div>
  </orio-zoomable-container>
</template>
```

### With Image

```vue
<template>
  <orio-zoomable-container :min-scale="0.5" :max-scale="10">
    <img src="/large-photo.jpg" alt="" />
  </orio-zoomable-container>
</template>
```

### With Canvas

```vue
<template>
  <orio-zoomable-container>
    <canvas ref="canvasEl" width="1600" height="1200" />
  </orio-zoomable-container>
</template>
```

### Programmatic Control

```vue
<template>
  <orio-zoomable-container ref="zoomRef">
    <div class="board">...</div>
  </orio-zoomable-container>
  <orio-button @click="zoomRef?.resetView()">Reset</orio-button>
</template>

<script setup>
import { useTemplateRef } from "vue";
const zoomRef = useTemplateRef("zoomRef");
</script>
```

### Reacting To Zoom Via Slot Prop

Use the scoped slot to counter-scale overlays (e.g. keep labels at constant size):

```vue
<template>
  <orio-zoomable-container v-slot="{ scale }">
    <div class="board">
      <div class="pin" :style="{ transform: `scale(${1 / scale})` }">
        Always same size
      </div>
    </div>
  </orio-zoomable-container>
</template>
```

## Props

| Prop            | Type     | Default  | Description                                |
| --------------- | -------- | -------- | ------------------------------------------ |
| `minScale`      | `number` | `0.1`    | Lower zoom bound                           |
| `maxScale`      | `number` | `10`     | Upper zoom bound                           |
| `initialScale`  | `number` | `1`      | Zoom level on mount                        |
| `zoomSpeed`     | `number` | `0.0015` | Wheel-delta multiplier for zoom            |
| `wheelPanSpeed` | `number` | `1`      | Wheel-delta multiplier for pan             |

## Events

| Event              | Payload            | Description                     |
| ------------------ | ------------------ | ------------------------------- |
| `update:scale`     | `number`           | Fires on zoom change            |
| `update:translate` | `(x: number, y)`   | Fires on pan change             |

## Slots

| Slot      | Props                               | Description         |
| --------- | ----------------------------------- | ------------------- |
| `default` | `{ scale, tx, ty }`                 | Content to transform |

## Exposed Methods

Access via `ref`:

| Method                        | Description                        |
| ----------------------------- | ---------------------------------- |
| `setScaleAt(scale, px, py)`   | Zoom to scale anchored at a point  |
| `panBy(dx, dy)`               | Pan by a pixel delta               |
| `centerWorld()`               | Center the content in the viewport |
| `resetView()`                 | Reset scale + recenter             |
| `scale`, `tx`, `ty`           | Reactive refs of current state     |

## Notes

- Viewport reserves half-its-axis-size of empty space around the content on every
  side — you can pan until the content edge reaches the viewport center.
- `transform: scale()` is GPU-accelerated; text may appear soft at non-integer
  zoom levels but remains selectable and accessible.
- `position: fixed` children escape the transform (browser limitation).
- For world-space click coordinates: `worldX = (clientX - rect.left - tx) / scale`.
