# ZoomableContainer

В'юпорт із перетягуванням і масштабуванням у стилі Figma. Покладіть усередину будь-який елемент
і керуйте ним жестами. Залишає навколо вмісту відступ у половину в'юпорту, тож можна прокручувати
за його краї.

## Жести

| Ввід                | Дія                 |
| ------------------- | ------------------- |
| Прокрутка / 2 пальці | Панорамування      |
| Shift + прокрутка   | Горизонтальне панорамування |
| Ctrl/Cmd + прокрутка | Масштаб у точці курсора |
| Щипок на трекпаді   | Масштаб у точці курсора |
| Перетягування середньою кнопкою | Панорамування будь-де |
| Space + перетягування | Панорамування будь-де |
| Перетягування по фону | Панорамування     |

## Живе демо — власні div

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
  <orio-button size="small" @click="zoomIn">Збільшити</orio-button>
  <orio-button size="small" @click="zoomOut">Зменшити</orio-button>
  <orio-button size="small" @click="reset">Скинути</orio-button>
</div>
<div class="zc-hint">Прокручуйте для панорамування, Ctrl/Cmd+прокрутка (або щипок) — масштаб, Space+перетягування чи середня кнопка миші — захоплення.</div>

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

## Зображення

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

## Canvas усередині

Дочірній `<canvas>` працює як будь-який інший елемент — браузер масштабує його растр.
Для піксельно точного рендеру за будь-якого масштабу перемальовуйте canvas під час зміни масштабу.

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

## Використання

### Базове

```vue
<template>
  <orio-zoomable-container style="width: 100%; height: 600px;">
    <div style="width: 2000px; height: 1500px;">
      <!-- any content -->
    </div>
  </orio-zoomable-container>
</template>
```

### Із зображенням

```vue
<template>
  <orio-zoomable-container :min-scale="0.5" :max-scale="10">
    <img src="/large-photo.jpg" alt="" />
  </orio-zoomable-container>
</template>
```

### З canvas

```vue
<template>
  <orio-zoomable-container>
    <canvas ref="canvasEl" width="1600" height="1200" />
  </orio-zoomable-container>
</template>
```

### Програмне керування

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

### Реакція на масштаб через проп слоту

Використовуйте scoped-слот, щоб компенсувати масштаб оверлеїв (наприклад, тримати підписи сталого розміру):

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

## Пропси

| Проп            | Тип      | За замовчуванням | Опис                               |
| --------------- | -------- | -------- | ------------------------------------------ |
| `minScale`      | `number` | `0.1`    | Нижня межа масштабу                        |
| `maxScale`      | `number` | `10`     | Верхня межа масштабу                       |
| `initialScale`  | `number` | `1`      | Рівень масштабу під час монтування         |
| `zoomSpeed`     | `number` | `0.0015` | Множник дельти колеса для масштабу         |
| `wheelPanSpeed` | `number` | `1`      | Множник дельти колеса для панорамування    |

## Події

| Подія              | Дані               | Опис                            |
| ------------------ | ------------------ | ------------------------------- |
| `update:scale`     | `number`           | Спрацьовує під час зміни масштабу |
| `update:translate` | `(x: number, y)`   | Спрацьовує під час панорамування |

## Слоти

| Слот      | Пропси                              | Опис                |
| --------- | ----------------------------------- | ------------------- |
| `default` | `{ scale, tx, ty }`                 | Вміст для трансформації |

## Відкриті методи

Доступ через `ref`:

| Метод                         | Опис                               |
| ----------------------------- | ---------------------------------- |
| `setScaleAt(scale, px, py)`   | Масштабувати з прив'язкою до точки |
| `panBy(dx, dy)`               | Зсунути на дельту в пікселях       |
| `centerWorld()`               | Відцентрувати вміст у в'юпорті     |
| `resetView()`                 | Скинути масштаб і відцентрувати    |
| `scale`, `tx`, `ty`           | Реактивні ref поточного стану      |

## Примітки

- В'юпорт залишає навколо вмісту з кожного боку порожній простір у половину свого розміру
  по осі — панорамувати можна, доки край вмісту не дійде до центру в'юпорту.
- `transform: scale()` прискорюється GPU; за нецілих рівнів масштабу текст може виглядати
  розмитим, але лишається доступним для виділення та скрінрідерів.
- Дочірні елементи з `position: fixed` виходять з-під трансформації (обмеження браузера).
- Координати кліку у світовому просторі: `worldX = (clientX - rect.left - tx) / scale`.
