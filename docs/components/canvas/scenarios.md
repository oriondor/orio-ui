# Canvas Scenarios

The `setup` prop lets you seed the canvas with initial content before the user
interacts with it. Think of it as a scenario — a pre-configured starting state
that can include text labels, shapes, guides, or any node type.

## Live Demo — Image Setup

<script setup>
import { ref, shallowRef } from "vue";
import { drawTool } from "../../../src/runtime/components/Canvas/tools/drawTool";
import { textTool } from "../../../src/runtime/components/Canvas/tools/textTool";
import { eraseTool } from "../../../src/runtime/components/Canvas/tools/eraseTool";
import { moveTool } from "../../../src/runtime/components/Canvas/tools/moveTool";
import { transformTool } from "../../../src/runtime/components/Canvas/tools/transformTool";
import { imageTool } from "../../../src/runtime/components/Canvas/tools/imageTool";
import { undoTool } from "../../../src/runtime/components/Canvas/tools/undoTool";
import { redoTool } from "../../../src/runtime/components/Canvas/tools/redoTool";
import { clearTool } from "../../../src/runtime/components/Canvas/tools/clearTool";
import { colorPickerTool } from "../../../src/runtime/components/Canvas/tools/colorPickerTool";

const nodes = ref([]);
const tools = shallowRef([
  drawTool({ color: "#1f7aec", size: 4 }),
  textTool({ fontSize: 24, color: "#222" }),
  eraseTool({ radius: 12 }),
  moveTool(),
  transformTool(),
  imageTool(),
  colorPickerTool({ color: "#1f7aec", targets: ["draw", "text"] }),
  undoTool(),
  redoTool(),
  clearTool(),
]);

async function onSetup(api) {
  const { width: cw, height: ch } = api.size();
  const w = 200;
  const h = 200;

  const img = new Image();
  img.src = "/samples/ball.png";

  await new Promise((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject();
  });

  api.addNode({
    type: "image",
    x: (cw - w) / 2,
    y: (ch - h) / 2,
    width: w,
    height: h,
    frozen: true,
    data: {
      src: img.src,
      naturalHeight: img.naturalHeight,
      naturalWidth: img.naturalWidth,
    },
  });

  api.addNode({
    type: "text",
    x: 200,
    y: 20,
    frozen: true,
    data: {
      text: "Draw over the image!",
      fontSize: 18,
      fontFamily: "system-ui, sans-serif",
      color: "#999",
      weight: "normal",
    },
  });
}
</script>

<div class="demo-container">
  <orio-canvas
    name="frozen-bg"
    v-model:nodes="nodes"
    :tools="tools"
    :setup="onSetup"
    :width="640"
    :height="360"
    background="#f7f8fa"
    style="border: 1px solid var(--vp-c-border); border-radius: 8px;"
  >
    <orio-canvas-toolbar canvas="frozen-bg" />
    <orio-canvas-stage />
  </orio-canvas>
  <p style="font-size: 0.875rem; opacity: 0.7;">
    {{ nodes.length }} node(s) on the canvas
  </p>
</div>

> The ball image is loaded during async `setup` and centered on the canvas.
> Both the image and the text label are **frozen** — they act as a non-interactive
> background. Try drawing over them with the **Draw** tool.

## Basic usage

Pass a function to `setup`. It receives the full `CanvasToolApi` and runs once
on mount:

```vue
<script setup>
import { ref, shallowRef } from "vue";
import { drawTool, textTool, eraseTool, undoTool, redoTool } from "orio-ui/canvas";

const nodes = ref([]);
const tools = shallowRef([
  drawTool(),
  textTool(),
  eraseTool(),
  undoTool(),
  redoTool(),
]);

function onSetup(api) {
  api.addNode({
    type: "text",
    x: 100,
    y: 40,
    data: {
      text: "Welcome to the canvas!",
      fontSize: 24,
      fontFamily: "system-ui, sans-serif",
      color: "#333",
      weight: "bold",
    },
  });
}
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

Nodes added during setup behave like any other node — the user can move, erase,
or interact with them using whatever tools you've registered.

## Frozen nodes

Set `frozen: true` on a node to protect it from interaction tools. The eraser
won't delete it, the move tool can't drag it, and the highlight tool won't
show its bounds. Use this for background content the user should see but not
modify.

```ts
function onSetup(api) {
  // Frozen instruction label
  api.addNode({
    type: "text",
    x: 50,
    y: 30,
    frozen: true,
    data: {
      text: "Sign here ↓",
      fontSize: 18,
      fontFamily: "system-ui",
      color: "#888",
      weight: "normal",
    },
  });

  // Frozen guide line (draw node)
  api.addNode({
    type: "draw",
    x: 0,
    y: 0,
    frozen: true,
    data: {
      points: [
        { x: 50, y: 200 },
        { x: 550, y: 200 },
      ],
      color: "#ddd",
      size: 1,
      opacity: 1,
      brush: "pen",
    },
  });
}
```

## Any node type, regardless of tools

The toolbar controls what the **user** can do. Setup can add any node type
regardless of which tools are registered. For example, you can seed text nodes
even if `textTool` isn't in the tools list — the text will render but the user
won't be able to create new text nodes.

```ts
const tools = shallowRef([drawTool(), eraseTool()]);

function onSetup(api) {
  // Add a text label even though textTool isn't registered
  api.addNode({
    type: "text",
    x: 200,
    y: 20,
    frozen: true,
    data: {
      text: "Draw something below",
      fontSize: 20,
      fontFamily: "system-ui, sans-serif",
      color: "#666",
      weight: "normal",
    },
  });
}
```

## Async setup

`setup` can return a promise. The canvas waits for it to resolve before
resetting the history baseline — so all async nodes are part of the initial
state and won't appear as undoable actions.

```ts
async function onSetup(api) {
  const res = await fetch("/api/canvas-template");
  const template = await res.json();

  for (const node of template.nodes) {
    api.addNode(node);
  }
}
```

## History baseline

After `setup` completes (sync or async), the history baseline is reset. This
means:

- Nodes added during setup are the "starting state"
- The user's first action after setup is the first undoable step
- Pressing undo won't remove the initial nodes

## Conditional scenarios

Since `setup` is just a function, you can make it conditional:

```vue
<script setup>
import { ref, shallowRef } from "vue";
import { drawTool, textTool, undoTool, redoTool } from "orio-ui/canvas";

const props = defineProps<{
  mode: "blank" | "guided" | "template";
}>();

const nodes = ref([]);
const tools = shallowRef([drawTool(), textTool(), undoTool(), redoTool()]);

function onSetup(api) {
  if (props.mode === "guided") {
    api.addNode({
      type: "text",
      x: 100,
      y: 40,
      frozen: true,
      data: {
        text: "Follow the dotted line:",
        fontSize: 18,
        fontFamily: "system-ui",
        color: "#888",
        weight: "normal",
      },
    });
  }

  if (props.mode === "template") {
    // Pre-populate with editable content
    api.addNode({
      type: "text",
      x: 200,
      y: 100,
      data: {
        text: "Edit me",
        fontSize: 32,
        fontFamily: "system-ui",
        color: "#333",
        weight: "bold",
      },
    });
  }

  // "blank" mode — setup runs but adds nothing
}
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

## Layering with zIndex

Control draw order by setting `zIndex` on nodes. Higher values render on top.

```ts
function onSetup(api) {
  // Background rectangle (lowest layer)
  api.addNode({
    type: "rectangle",
    x: 50,
    y: 50,
    width: 300,
    height: 200,
    zIndex: 0,
    frozen: true,
    data: { fill: "#f0f0f0", stroke: "#ccc", strokeWidth: 1 },
  });

  // Foreground label (above the rectangle)
  api.addNode({
    type: "text",
    x: 100,
    y: 130,
    zIndex: 10,
    frozen: true,
    data: {
      text: "Draw inside this box",
      fontSize: 16,
      fontFamily: "system-ui",
      color: "#999",
      weight: "normal",
    },
  });
}
```

The user can reorder non-frozen nodes with the move tool using
<kbd>[</kbd> / <kbd>]</kbd>.

## Restoring saved state

Combine `setup` with `v-model:nodes` to restore a previously saved canvas:

```vue
<script setup>
import { ref } from "vue";

const nodes = ref([]);

function onSetup(api) {
  const saved = localStorage.getItem("my-canvas");
  if (saved) {
    const restored = JSON.parse(saved);
    for (const node of restored) {
      api.addNode(node);
    }
  }
}
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

> **Tip:** Since `addNode` auto-generates ids, restored nodes will get new ids.
> If you need stable ids (e.g. for collaborative editing), pass the original
> `id` in the node object — `addNode` respects explicit ids.

## Pre-loading images

You can add image nodes during setup by providing a `src` (any URL or data URL)
along with the image's natural dimensions. The `imageTool` renderer will decode
and paint them automatically.

```vue
<script setup>
import { ref, shallowRef } from "vue";
import {
  drawTool,
  eraseTool,
  moveTool,
  transformTool,
  imageTool,
  undoTool,
  redoTool,
} from "orio-ui/canvas";

const nodes = ref([]);
const tools = shallowRef([
  drawTool(),
  eraseTool(),
  moveTool(),
  transformTool(),
  imageTool(),
  undoTool(),
  redoTool(),
]);

/** Convert an HTMLImageElement to a data URL for inline decoding. */
function toDataUrl(img) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d").drawImage(img, 0, 0);
  return c.toDataURL("image/png");
}

async function onSetup(api) {
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load image"));
    el.src = "/images/sample-background.png";
  });

  // Convert to data URL so the node is self-contained and
  // imageTool's render cache decodes it without a second fetch.
  const src = toDataUrl(img);

  const { width: cw, height: ch } = api.size();
  const maxSize = 300;
  const scale = Math.min(
    1,
    maxSize / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;

  api.addNode({
    type: "image",
    x: (cw - w) / 2,
    y: (ch - h) / 2,
    width: w,
    height: h,
    frozen: true,
    data: {
      src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      alt: "Background image",
    },
  });
}
</script>

<template>
  <orio-canvas name="editor" v-model:nodes="nodes" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar canvas="editor" />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

Converting to a data URL ensures the image data is embedded in the node. When
`imageTool`'s render cache decodes it, the data is inline — no second network
request needed.

> **Tip:** Set `frozen: true` if the image should act as a non-interactive
> background. Remove it if you want users to move, resize, or delete the image.

## API reference

The `setup` function receives the same `CanvasToolApi` that tools get. The most
useful methods for scenarios:

| Method                | Description                                        |
| --------------------- | -------------------------------------------------- |
| `api.addNode(node)`   | Add a node. Returns the created node with id.      |
| `api.nodes`           | Read current nodes (useful for conditional logic). |
| `api.size()`          | Get canvas dimensions for centering content.       |
| `api.requestRender()` | Force a redraw (rarely needed in setup).           |

See [Extending Canvas](./extending.md) for the full `CanvasToolApi` reference.
