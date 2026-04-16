# Extending Canvas

`<orio-canvas>` is intentionally a thin core. Drawing primitives, brushes,
selection, image handling, exporters — they're all written as **tools** that
plug into the same registry the built-in `drawTool()` and `textTool()` use.

If you've used [tiptap](https://tiptap.dev), the mental model is the same:
the editor (here, the canvas) owns state and dispatch; extensions (here,
tools) register handlers and rendering.

## What is a tool?

A tool is a plain object describing:

1. **Identity** — `id`, `label`, optional `icon`, `cursor`, and `tooltip`.
2. **Pointer behavior** — `onPointerDown`, `onPointerMove`, `onPointerUp`.
3. **Keyboard behavior** — `onKeyDown` for tool-specific shortcuts.
4. **Rendering** — a `render(ctx, node)` function called for every node whose
   `type` matches the tool's `id`, and an optional `renderOverlay(ctx, api)`
   for transient visuals (hover highlights, selection handles, etc.).
5. **Per-tool options** — a reactive bag of settings (color, size, font, ...)
   that lives on the canvas context.

```ts
import { defineCanvasTool } from "@your-org/orio-ui";

export const noopTool = defineCanvasTool({
  id: "noop",
  label: "Do nothing",
  icon: "pencil",
  cursor: "default",
  onPointerDown(e, api) { /* ... */ },
  render(ctx, node) { /* ... */ },
});
```

`defineCanvasTool` is just a typed pass-through — its job is to preserve the
generic parameters so your `render(ctx, node)` gets a properly typed `node.data`.

## Tool interface

Full list of properties you can set on a tool object:

| Property          | Type                                       | Description                                                |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `id`              | `string`                                   | Stable id. Also used as `node.type` for nodes this tool creates. |
| `label`           | `string?`                                  | Human-readable name for the toolbar.                       |
| `icon`            | `IconName \| string?`                      | Icon from the Orio icon registry.                          |
| `cursor`          | `string?`                                  | CSS cursor while this tool is active.                      |
| `tooltip`         | `Component?`                               | Vue component rendered in the toolbar tooltip on hover.    |
| `kind`            | `"interaction" \| "action" \| "widget"?`   | Toolbar behavior. Defaults to `"interaction"`.             |
| `defaultOptions`  | `TOptions?`                                | Initial values for the reactive options bag.               |
| `onPointerDown`   | `(e, api) => void`                         | Called on pointer down (interaction tools only).            |
| `onPointerMove`   | `(e, api) => void`                         | Called on pointer move (interaction tools only).            |
| `onPointerUp`     | `(e, api) => void`                         | Called on pointer up (interaction tools only).              |
| `onKeyDown`       | `(e: KeyboardEvent, api) => void`          | Called on key down while this tool is active.               |
| `onActivate`      | `(api) => void`                            | Called when the user switches to this tool.                 |
| `onDeactivate`    | `(api) => void`                            | Called when the user switches away.                         |
| `render`          | `(ctx, node) => void`                      | Draw a node owned by this tool.                            |
| `renderOverlay`   | `(ctx, api) => void`                       | Draw transient overlay graphics after all nodes render.     |
| `hitTest`         | `(node, point, radius) => boolean`         | Custom hit detection for erase/move/highlight.             |
| `action`          | `(api) => void`                            | For action tools: callback on click.                       |
| `disabled`        | `(api) => boolean`                         | For action tools: reactive disabled state.                 |
| `toolbar`         | `Component?`                               | For widget tools: Vue component rendered in the toolbar.   |

## The tool API

Every pointer handler and lifecycle hook receives a `CanvasToolApi` object:

```ts
interface CanvasToolApi<TOptions> {
  options: TOptions;                      // reactive, mutable
  nodes: Ref<CanvasNode[]>;               // read-only — use helpers below
  addNode(node): CanvasNode;
  updateNode(id, patch): void;
  removeNode(id): void;
  getNode(id): CanvasNode | undefined;
  clear(): void;
  requestRender(): void;                  // schedule a redraw next frame
  stageEl(): HTMLElement | null;          // mount overlays here
  size(): { width, height };              // current CSS-pixel size
  undo(): void;
  redo(): void;
  canUndo: ComputedRef<boolean>;
  canRedo: ComputedRef<boolean>;
  getToolOptions<T>(id: string): T;       // read/write another tool's options
  getTools(): CanvasTool[];               // all registered tools
}
```

A few rules of thumb:

- **Mutating `node.data` in place is fine** as long as you call
  `api.requestRender()` afterwards. The freehand `drawTool` does this so it
  doesn't allocate a new array on every pointer move.
- **For data you want to persist**, prefer `addNode` / `updateNode`. Replacing
  the array fires the `v-model:nodes` update.
- **`stageEl()` is your hook for HTML overlays** — text editors, image
  croppers, transform handles. The stage is `position: relative`, so absolute
  positioning with canvas-space coordinates "just works".
- **`api.options` is reactive.** A settings panel can `v-model` directly into
  it via `getToolOptions(toolId)`.

## Building a custom tool: rectangle

Here's a complete tool that lets the user drag to draw a filled rectangle.

```ts
// tools/rectangleTool.ts
import { defineCanvasTool } from "@your-org/orio-ui";

interface RectOptions extends Record<string, unknown> {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface RectData {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export function rectangleTool(options: Partial<RectOptions> = {}) {
  let activeId: string | null = null;
  let startX = 0;
  let startY = 0;

  return defineCanvasTool<RectData, RectOptions>({
    id: "rectangle",
    label: "Rectangle",
    icon: "box",
    cursor: "crosshair",
    defaultOptions: {
      fill: "#ffe066",
      stroke: "#222",
      strokeWidth: 2,
      ...options,
    },
    onPointerDown(e, api) {
      startX = e.x;
      startY = e.y;
      const node = api.addNode({
        type: "rectangle",
        x: e.x,
        y: e.y,
        width: 0,
        height: 0,
        data: {
          fill: api.options.fill,
          stroke: api.options.stroke,
          strokeWidth: api.options.strokeWidth,
        },
      });
      activeId = node.id;
    },
    onPointerMove(e, api) {
      if (!activeId || e.buttons === 0) return;
      api.updateNode(activeId, {
        x: Math.min(startX, e.x),
        y: Math.min(startY, e.y),
        width: Math.abs(e.x - startX),
        height: Math.abs(e.y - startY),
      });
    },
    onPointerUp(_, api) {
      // If the user just clicked without dragging, drop the empty node.
      if (activeId) {
        const node = api.getNode(activeId);
        if (node && (!node.width || !node.height)) {
          api.removeNode(activeId);
        }
      }
      activeId = null;
    },
    render(ctx, node) {
      const { fill, stroke, strokeWidth } = node.data;
      ctx.save();
      ctx.fillStyle = fill;
      ctx.fillRect(node.x, node.y, node.width ?? 0, node.height ?? 0);
      if (strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.strokeRect(node.x, node.y, node.width ?? 0, node.height ?? 0);
      }
      ctx.restore();
    },
  });
}
```

Then drop it into the tool list:

```vue
<script setup>
import { drawTool, textTool } from "@your-org/orio-ui";
import { rectangleTool } from "./tools/rectangleTool";
import { shallowRef } from "vue";

const tools = shallowRef([
  drawTool(),
  textTool(),
  rectangleTool({ fill: "#cdeac0" }),
]);
</script>

<template>
  <orio-canvas :tools="tools">
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

The default toolbar will pick it up automatically — id, label, icon and all.

## Overlay rendering

Use `renderOverlay` to draw transient visuals that aren't persisted as nodes —
hover highlights, selection rectangles, guides, snap lines, etc. It runs once
per frame after all nodes have been painted, only for the **active** tool.

```ts
defineCanvasTool({
  id: "my-tool",
  renderOverlay(ctx, api) {
    // Draw a crosshair at (100, 100)
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(90, 100);
    ctx.lineTo(110, 100);
    ctx.moveTo(100, 90);
    ctx.lineTo(100, 110);
    ctx.stroke();
    ctx.restore();
  },
});
```

The built-in `moveTool`, `eraseTool`, and `highlightTool` all use
`renderOverlay` to show bounding-rect highlights on hover.

## Keyboard shortcuts

Tools can handle keyboard events via `onKeyDown`. It fires while the tool is
active and the stage is focused. If the tool calls `e.preventDefault()`, the
event won't propagate to the default undo/redo handler.

```ts
defineCanvasTool({
  id: "my-tool",
  onKeyDown(e, api) {
    if (e.key === "Delete") {
      // Remove selected node, etc.
      e.preventDefault();
    }
  },
});
```

The built-in `moveTool` uses this for <kbd>[</kbd> / <kbd>]</kbd> layer
reordering.

## Custom hit testing

When the erase, move, or highlight tools need to determine if a pointer
intersects a node, they call the owning tool's `hitTest` method. If a tool
doesn't define one, a default bounding-box check is used.

```ts
defineCanvasTool<MyNodeData>({
  id: "my-tool",
  hitTest(node, point, radius) {
    // Custom proximity check for circular nodes
    const dx = point.x - node.x;
    const dy = point.y - node.y;
    const nodeRadius = node.data.radius ?? 20;
    return dx * dx + dy * dy <= (nodeRadius + radius) ** 2;
  },
});
```

## Custom toolbars and tool buttons

The default `<orio-canvas-toolbar>` is fine for prototyping. For production
you'll usually want your own UI. There are three levels of override.

### Level 1 — replace tool button content

Use the default slot of `<orio-canvas-tool-button>`:

```vue
<orio-canvas-toolbar v-slot="{ tools }">
  <orio-canvas-tool-button
    v-for="tool in tools"
    :key="tool.id"
    :tool="tool"
    v-slot="{ isActive, activate }"
  >
    <my-fancy-button :active="isActive" @click="activate">
      {{ tool.label }}
    </my-fancy-button>
  </orio-canvas-tool-button>
</orio-canvas-toolbar>
```

### Level 2 — replace the toolbar layout

Use the default slot of `<orio-canvas-toolbar>` to render whatever you want
around the tool list:

```vue
<orio-canvas-toolbar v-slot="{ tools, activeToolId, setActiveTool }">
  <orio-button
    v-for="tool in tools"
    :key="tool.id"
    appearance="minimal"
    :variant="tool.id === activeToolId ? 'primary' : 'subdued'"
    @click="setActiveTool(tool.id)"
  >
    <orio-icon v-if="tool.icon" :name="tool.icon" />
    {{ tool.label }}
  </orio-button>
</orio-canvas-toolbar>
```

### Level 3 — write your own toolbar component

Anywhere inside an `<orio-canvas>` parent you can call `useCanvasContext()`
and build any UI you like:

```vue
<!-- MyToolPanel.vue -->
<script setup lang="ts">
import { useCanvasContext } from "@your-org/orio-ui";

const ctx = useCanvasContext();
</script>

<template>
  <aside class="tool-panel">
    <orio-button
      v-for="tool in ctx.tools.value"
      :key="tool.id"
      appearance="minimal"
      :variant="ctx.activeToolId.value === tool.id ? 'primary' : 'subdued'"
      :aria-pressed="ctx.activeToolId.value === tool.id"
      @click="ctx.setActiveTool(tool.id)"
    >
      {{ tool.label }}
    </orio-button>
  </aside>
</template>
```

```vue
<orio-canvas v-slot>
  <my-tool-panel />
  <orio-canvas-stage />
</orio-canvas>
```

## Reading and writing tool options

Each tool has a reactive options bag keyed by tool id. You can read and write
it from outside the tool — that's how settings panels stay in sync.

```vue
<script setup>
import { ref, watchEffect } from "vue";

const canvasRef = ref();
const brushSize = ref(8);

watchEffect(() => {
  const opts = canvasRef.value?.getToolOptions("draw");
  if (opts) opts.size = brushSize.value;
});
</script>

<template>
  <orio-canvas ref="canvasRef">
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>
  <input v-model.number="brushSize" type="range" min="1" max="40" />
</template>
```

You can also reach into the same options inside another tool's pointer
handler — e.g. an "eyedropper" tool that writes to `draw.color`.

## Custom tooltips

Every tool can provide a `tooltip` property — a Vue component rendered inside
the toolbar tooltip on hover. Use it to show descriptions, keyboard shortcuts,
or any styled content.

```vue
<!-- tooltips/MyToolTip.vue -->
<template>
  <div class="tool-tip">
    <orio-view-text type="title" size="medium">My Tool</orio-view-text>
    <orio-view-text type="subtitle" size="small">
      Does something cool.
    </orio-view-text>
    <orio-view-key-binds bind="`Shift` + click for precision" />
  </div>
</template>

<style scoped>
.tool-tip {
  --view-text-color: white;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-width: 200px;
  white-space: normal;
}
</style>
```

```ts
import { defineCanvasTool } from "@your-org/orio-ui";
import MyToolTip from "./tooltips/MyToolTip.vue";

export function myTool() {
  return defineCanvasTool({
    id: "my-tool",
    label: "My Tool",
    icon: "pencil",
    tooltip: MyToolTip,
    // ...
  });
}
```

If no `tooltip` is set, the toolbar falls back to displaying the tool's
`label`. All built-in tools ship with their own tooltip components showing
a description and relevant keyboard shortcuts.

## Custom node types

There is no central registry for node types — `node.type` is just a string
that matches some tool's `id`. When the stage renders, it asks each tool
"render any nodes you own", and unknown node types are silently skipped.

This means:

- You can hydrate a saved document before all tools are registered; nodes
  whose tools aren't loaded yet are simply invisible until they are.
- Two tools can render the same node type if you want a "render-only" tool
  paired with an "interaction-only" tool. Just give them the same `id` — but
  the second registration will win for pointer handlers.

## Mounting HTML overlays

Some tools need a real DOM element on top of the canvas — text editors,
image croppers, transform handles. `api.stageEl()` returns the stage's root
`<div>`, which is `position: relative`. Append children with absolute
positioning and canvas-space coordinates:

```ts
onPointerDown(e, api) {
  const stage = api.stageEl();
  if (!stage) return;
  const handle = document.createElement("div");
  handle.style.position = "absolute";
  handle.style.left = `${e.x}px`;
  handle.style.top = `${e.y}px`;
  handle.style.transform = "translate(-50%, -50%)";
  stage.appendChild(handle);
  // ...remember to remove it on commit/cancel
}
```

The built-in `textTool` does exactly this — read its source for a complete
working pattern (commit on blur, cancel on Escape, position relative to the
click point).

## Lifecycle

```ts
defineCanvasTool({
  id: "demo",
  onActivate(api) {
    // Called when the user switches to this tool.
  },
  onDeactivate(api) {
    // Called when the user switches away — clean up overlays, listeners, etc.
  },
});
```

Use these to teardown any DOM you appended in `stageEl()`, cancel uploads,
reset hover state and so on.

## Tips

- **Each tool factory should own its own closure state.** That's why
  `drawTool()` is a function and not a singleton object — two canvases on the
  same page each get their own "currently drawing" id without trampling.
- **Operate in canvas-space.** Pointer events arrive with `x`/`y` already
  translated to the canvas coordinate system. When zoom/pan lands later,
  tools that stuck to canvas-space will keep working unchanged.
- **Avoid blocking the main thread in `render`.** It runs on every frame
  while the user is drawing. Cache anything expensive on the node's `data`.
- **Don't mutate `nodes` directly.** Use `addNode` / `updateNode` /
  `removeNode` so the array reference changes and `v-model:nodes` fires.
- **Persist what you need to render.** Snapshots of the active option bag
  (color, font, ...) belong in the node's `data`, not the tool's options —
  otherwise changing tool settings would retroactively restyle past nodes.
- **Use `renderOverlay` for transient visuals.** Don't create/remove nodes
  for hover highlights or guides — use the overlay pass instead.
- **Clean up in `onDeactivate`.** Reset hover state, remove DOM overlays, and
  call `requestRender()` to clear any overlay graphics.
