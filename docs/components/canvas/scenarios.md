# Canvas Scenarios

The `setup` prop lets you seed the canvas with initial content before the user
interacts with it. Think of it as a scenario — a pre-configured starting state
that can include text labels, shapes, guides, or any node type.

## Basic usage

Pass a function to `setup`. It receives the full `CanvasToolApi` and runs once
on mount:

```vue
<script setup>
import { ref, shallowRef } from "vue";
import { drawTool, textTool, eraseTool, undoTool, redoTool } from "@your-org/orio-ui";

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
  <orio-canvas v-model:nodes="nodes" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar />
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
import { drawTool, textTool, undoTool, redoTool } from "@your-org/orio-ui";

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
  <orio-canvas v-model:nodes="nodes" :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar />
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
  <orio-canvas v-model:nodes="nodes" :setup="onSetup">
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

> **Tip:** Since `addNode` auto-generates ids, restored nodes will get new ids.
> If you need stable ids (e.g. for collaborative editing), pass the original
> `id` in the node object — `addNode` respects explicit ids.

## API reference

The `setup` function receives the same `CanvasToolApi` that tools get. The most
useful methods for scenarios:

| Method              | Description                                  |
| ------------------- | -------------------------------------------- |
| `api.addNode(node)` | Add a node. Returns the created node with id. |
| `api.nodes`         | Read current nodes (useful for conditional logic). |
| `api.size()`        | Get canvas dimensions for centering content. |
| `api.requestRender()` | Force a redraw (rarely needed in setup).   |

See [Extending Canvas](./extending.md) for the full `CanvasToolApi` reference.
