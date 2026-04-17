# Canvas

A pluggable, tiptap-flavored playground built on a single HTML `<canvas>`. The
core owns the surface, node storage, render loop and pointer dispatch —
everything else (tools, toolbars, node kinds, UI chrome) is registered by you.

**No tools are included by default.** You explicitly specify every tool the
canvas should have — draw, text, undo, redo, clear, color picker, or your own
custom tools. See [Extending Canvas](./extending.md) for authoring custom tools.

## Live Demo

<script setup>
import { ref, shallowRef } from "vue";
import { drawTool } from "../../../src/runtime/components/Canvas/tools/drawTool";
import { textTool } from "../../../src/runtime/components/Canvas/tools/textTool";
import { eraseTool } from "../../../src/runtime/components/Canvas/tools/eraseTool";
import { undoTool } from "../../../src/runtime/components/Canvas/tools/undoTool";
import { redoTool } from "../../../src/runtime/components/Canvas/tools/redoTool";
import { clearTool } from "../../../src/runtime/components/Canvas/tools/clearTool";
import { colorPickerTool } from "../../../src/runtime/components/Canvas/tools/colorPickerTool";
import { moveTool } from "../../../src/runtime/components/Canvas/tools/moveTool";
import { highlightTool } from "../../../src/runtime/components/Canvas/tools/highlightTool";
import { rotateTool } from "../../../src/runtime/components/Canvas/tools/rotateTool";
import { resizeTool } from "../../../src/runtime/components/Canvas/tools/resizeTool";
import { transformTool } from "../../../src/runtime/components/Canvas/tools/transformTool";
import { imageTool } from "../../../src/runtime/components/Canvas/tools/imageTool";
import { exportTool } from "../../../src/runtime/components/Canvas/tools/exportTool";

const tools = shallowRef([
  drawTool({ color: "#1f7aec", size: 5 }),
  textTool({ fontSize: 28, color: "#222" }),
  eraseTool({ radius: 12 }),
  moveTool(),
  rotateTool(),
  resizeTool(),
  transformTool(),
  highlightTool(),
  imageTool(),
  colorPickerTool({ color: "#1f7aec", targets: ["draw", "text"] }),
  undoTool(),
  redoTool(),
  clearTool(),
  exportTool({ filename: "canvas-demo" }),
]);

const nodes = ref([]);

function onSetup(api) {
  api.addNode({
    type: "text",
    x: 220,
    y: 30,
    frozen: true,
    data: {
      text: "Draw here! (this text is frozen)",
      fontSize: 20,
      fontFamily: "system-ui, sans-serif",
      color: "#999",
      weight: "normal",
    },
  });
}
</script>

<div class="demo-container">
  <orio-canvas
    v-model:nodes="nodes"
    :tools="tools"
    :setup="onSetup"
    :width="640"
    :height="360"
    background="#f7f8fa"
    style="border: 1px solid var(--vp-c-border); border-radius: 8px;"
  >
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>
  <p style="font-size: 0.875rem; opacity: 0.7;">
    {{ nodes.length }} node(s) on the canvas
  </p>
</div>

> Pick the **Draw** tool and drag to draw, or the **Text** tool and click
> anywhere to drop text. Press <kbd>Enter</kbd> to commit, <kbd>Esc</kbd> to
> cancel. Use <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Z</kbd> to undo. Try **Transform**
> — click a node to select it, then drag corners to resize, the top circle to
> rotate, or the body to move.

## Quick Start

```vue
<script setup>
import { ref, shallowRef } from "vue";
import {
  drawTool,
  textTool,
  eraseTool,
  moveTool,
  undoTool,
  redoTool,
  clearTool,
} from "@your-org/orio-ui";

const nodes = ref([]);
const tools = shallowRef([
  drawTool(),
  textTool(),
  eraseTool(),
  moveTool(),
  undoTool(),
  redoTool(),
  clearTool(),
]);
</script>

<template>
  <orio-canvas v-model:nodes="nodes" :tools="tools" :width="800" :height="500">
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

You explicitly list every tool — the canvas is inert without them.

## Props

| Prop          | Type              | Default                     | Description                                              |
| ------------- | ----------------- | --------------------------- | -------------------------------------------------------- |
| `tools`       | `CanvasTool[]`    | `[]`                        | Tools available on the canvas. Empty by default.         |
| `width`       | `number`          | `800`                       | Drawing surface width in CSS pixels.                     |
| `height`      | `number`          | `500`                       | Drawing surface height in CSS pixels.                    |
| `defaultTool` | `string`          | first interaction tool's id | Initially active tool id.                                |
| `background`  | `string`          | `"transparent"`             | CSS background applied to the wrapper.                   |
| `maxHistory`  | `number`          | `50`                        | Maximum number of undo steps to keep.                    |
| `setup`       | `(api) => void \| Promise<void>` | —              | Called once on mount to seed initial nodes.               |

## Model

| Model     | Type           | Description                                            |
| --------- | -------------- | ------------------------------------------------------ |
| `nodes`   | `CanvasNode[]` | Persisted node list. Use `v-model:nodes` to round-trip. |

## Default Slot

The default slot lets you replace the entire layout (toolbar position, extra
chrome, etc.). When no slot content is provided, the canvas renders
`<Toolbar />` and `<Stage />` automatically.

Use `useCanvasContext()` inside any child component to access the full canvas
API.

```vue
<orio-canvas :width="600" :height="400">
  <header style="display: flex; justify-content: space-between;">
    <orio-canvas-toolbar />
  </header>
  <orio-canvas-stage />
</orio-canvas>
```

## Sub-components

`<orio-canvas>` is composed from a few small SFCs that you can compose
manually inside the default slot:

- **`<orio-canvas-toolbar>`** — renders one `<orio-canvas-tool-button>` per
  tool. Slot exposes `{ tools, activeToolId, setActiveTool }`.
- **`<orio-canvas-stage>`** — the actual `<canvas>` element with pointer
  dispatch, keyboard handling, and DPR-aware rendering.
- **`<orio-canvas-tool-button>`** — single tool button wrapped in
  `<orio-tooltip>`. For interaction/action tools it renders an `<orio-button>`
  with `appearance="minimal"`. Widget tools render their `toolbar` component
  directly. Default slot exposes `{ tool, isActive, activate }`.

All three call `useCanvasContext()` internally, so they only work inside an
`<orio-canvas>` parent.

### ToolButton behavior

- **Interaction tools** — click activates the tool. The button uses
  `variant="primary"` when active, `variant="subdued"` otherwise.
- **Action tools** — click fires `tool.action(api)`. Button is disabled when
  `tool.disabled(api)` returns true.
- **Widget tools** — renders `<component :is="tool.toolbar" :tool="tool" />`
  instead of a button.
- **Tooltips** — each button is wrapped in `<orio-tooltip>`. If the tool has a
  `tooltip` component, it's rendered in the `#content` slot. Otherwise the
  tool's `label` is shown. The tooltip auto-hides on click and re-appears on
  mouseout.

### Overriding toolbar buttons

```vue
<orio-canvas v-slot>
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
  <orio-canvas-stage />
</orio-canvas>
```

### Overriding tooltip content

```vue
<orio-canvas-tool-button :tool="myTool">
  <template #tooltip>
    <orio-view-text type="title" size="medium">Custom tip</orio-view-text>
  </template>
</orio-canvas-tool-button>
```

## Initial Setup (Scenarios)

Use the `setup` prop to seed the canvas with initial content — text labels,
shapes, background drawings, etc. Nodes added during setup can be `frozen: true`
to lock them from user interaction (the eraser, move, and highlight tools will
skip frozen nodes).

The toolbar controls what the **user** can do. Setup can add any node type
regardless of which tools are registered.

```vue
<script setup>
import { drawTool, eraseTool } from "@your-org/orio-ui";
import { shallowRef } from "vue";

const tools = shallowRef([drawTool(), eraseTool()]);

function onSetup(api) {
  // Add a frozen label the user can't erase or move
  api.addNode({
    type: "text",
    x: 100,
    y: 40,
    frozen: true,
    data: {
      text: "Sign here ↓",
      fontSize: 18,
      fontFamily: "system-ui",
      color: "#888",
      weight: "normal",
    },
  });
}
</script>

<template>
  <orio-canvas :tools="tools" :setup="onSetup">
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

`setup` also accepts an async function — useful if you need to load images or
fetch initial data before adding nodes. After setup completes, the history
baseline is reset so initial nodes don't count as an undoable action.

For more patterns — conditional scenarios, async loading, layering, restoring
saved state — see [Canvas Scenarios](./scenarios.md).

## Working with Nodes

Nodes are plain objects you can serialize, persist and re-hydrate:

```ts
interface CanvasNode<TData = unknown> {
  id: string;
  type: string;        // matches the tool that owns this node
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  frozen?: boolean;
  zIndex?: number;
  data: TData;         // tool-specific payload (stroke points, text content, ...)
}
```

### Save and load

```vue
<script setup>
import { ref, watch } from "vue";

const nodes = ref([]);

// Restore from localStorage
const saved = localStorage.getItem("my-canvas");
if (saved) {
  try {
    nodes.value = JSON.parse(saved);
  } catch {
    // Ignore malformed data — start with an empty canvas.
  }
}

watch(nodes, (next) => {
  localStorage.setItem("my-canvas", JSON.stringify(next));
}, { deep: true });
</script>

<template>
  <orio-canvas v-model:nodes="nodes">
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>
</template>
```

### Freezing nodes

`frozen: true` prevents interaction tools from affecting the node. The eraser
skips frozen nodes, the move tool can't pick them up, and the highlight tool
won't show bounds for them. Use it for background labels, watermarks, or
template content the user shouldn't modify.

## Built-in Tools

Every tool is a factory function you import and call. There are three kinds:

- **Interaction tools** (`drawTool`, `textTool`, `eraseTool`, `moveTool`, `rotateTool`, `resizeTool`, `transformTool`, `highlightTool`) — become the active tool, receive pointer events. Erase and move show hover highlights; rotate/resize/transform use a click-to-select model and render handles around the selected node. `transformTool` combines move, resize, and rotate into a single dispatcher.
- **Action tools** (`undoTool`, `redoTool`, `clearTool`, `imageTool`, `exportTool`) — fire on click, never become active. They can be disabled. `imageTool` opens a file picker (PNG, JPEG, WebP, GIF, SVG, AVIF, BMP) and adds the file as an `image` node. `exportTool` downloads the canvas as PNG, JPEG, or WebP.
- **Widget tools** (`colorPickerTool`) — render a custom component in the toolbar instead of a button.

All built-in tools ship with tooltip components (using `orio-view-text` and
`orio-view-key-binds`) showing descriptions and keyboard shortcuts on hover.

### Connecting tools

Import the factories you need and pass them as a `shallowRef` array:

```ts
import {
  drawTool,
  textTool,
  eraseTool,
  moveTool,
  rotateTool,
  resizeTool,
  transformTool,
  highlightTool,
  imageTool,
  exportTool,
  colorPickerTool,
  undoTool,
  redoTool,
  clearTool,
} from "@your-org/orio-ui";

const tools = shallowRef([
  // Interaction tools — order determines toolbar button order
  drawTool({ color: "#1f7aec", size: 5 }),
  textTool({ fontSize: 28, color: "#222" }),
  eraseTool({ radius: 12 }),
  moveTool(),
  rotateTool(),
  resizeTool(),
  transformTool(),
  highlightTool(),

  // Widget tools
  colorPickerTool({ color: "#1f7aec", targets: ["draw", "text"] }),

  // Action tools
  imageTool(),
  exportTool({ format: "png", filename: "my-canvas" }),
  undoTool(),
  redoTool(),
  clearTool(),
]);
```

Each factory accepts an optional options object that overrides the tool's
defaults. Pass only what you want to change — the rest uses sensible defaults.

### `drawTool(options?)`

Freehand pen with smoothing. Renders a `draw` node with an array of points.

| Option    | Type                  | Default     |
| --------- | --------------------- | ----------- |
| `color`   | `string`              | `"#111111"` |
| `size`    | `number`              | `4`         |
| `opacity` | `number` (0–1)        | `1`         |
| `brush`   | `"pen" \| "marker"`   | `"pen"`     |

### `textTool(options?)`

Click anywhere to drop text. Opens an inline `<input>` overlay positioned over
the click; <kbd>Enter</kbd> commits, <kbd>Esc</kbd> cancels.

| Option       | Type                                 | Default               |
| ------------ | ------------------------------------ | --------------------- |
| `fontSize`   | `number`                             | `24`                  |
| `fontFamily` | `string`                             | `"system-ui, sans-serif"` |
| `color`      | `string`                             | `"#111111"`           |
| `weight`     | `"normal" \| "bold" \| number`       | `"normal"`            |

### `eraseTool(options?)`

Interaction tool. Drag over nodes to erase them. Highlights the target node in
red on hover via `renderOverlay`. Respects `frozen` — frozen nodes are never
erased. Uses each tool's `hitTest` method for accurate detection; falls back to
bounding box for tools without one.

| Option   | Type     | Default |
| -------- | -------- | ------- |
| `radius` | `number` | `10`    |

### `moveTool(options?)`

Interaction tool. Click and drag to move nodes. Picks the topmost non-frozen
node under the pointer. Highlights the target node on hover via `renderOverlay`.
Handles draw nodes by shifting all points.

Press <kbd>]</kbd> to bring the hovered or dragged node forward or <kbd>[</kbd>
to send it backward (changes `zIndex`). Uses `onKeyDown` — requires stage focus.

| Option   | Type     | Default |
| -------- | -------- | ------- |
| `radius` | `number` | `10`    |

### `highlightTool(options?)`

Interaction tool. Hover over nodes to see a dashed bounding rect via
`renderOverlay`. Useful for inspecting node positions. Skips frozen nodes.
Clears highlight on `onDeactivate`.

| Option        | Type     | Default                        |
| ------------- | -------- | ------------------------------ |
| `radius`      | `number` | `10`                           |
| `strokeColor` | `string` | `"rgba(31, 122, 236, 0.8)"`   |
| `fillColor`   | `string` | `"rgba(31, 122, 236, 0.08)"`  |
| `lineWidth`   | `number` | `2`                            |

### `undoTool()`

Action tool. Calls `api.undo()`. Disabled when `api.canUndo` is false.

### `redoTool()`

Action tool. Calls `api.redo()`. Disabled when `api.canRedo` is false.

### `clearTool()`

Action tool. Calls `api.clear()`. Disabled when `api.nodes.value.length === 0`.

### `colorPickerTool(options?)`

Widget tool. Renders a native color `<input>` in the toolbar via the `toolbar`
component property. Syncs the picked color to the `color` option of the
specified target tools using `api.getToolOptions()`.

| Option    | Type       | Default     |
| --------- | ---------- | ----------- |
| `color`   | `string`   | `"#111111"` |
| `targets` | `string[]` | `[]`        |

```ts
colorPickerTool({ color: "#1f7aec", targets: ["draw", "text"] })
```

### Tool kinds

When authoring a custom tool, set `kind` on the tool object:

```ts
defineCanvasTool({
  id: "my-action",
  label: "Do thing",
  kind: "action",
  action(api) { /* fired on click */ },
  disabled(api) { return false; },
});
```

| Kind            | Toolbar behavior                              | Receives pointer events? |
| --------------- | --------------------------------------------- | ------------------------ |
| `"interaction"` | Toggles active via `orio-button` (default)    | Yes                      |
| `"action"`      | Fires `action()` on click via `orio-button`   | No                       |
| `"widget"`      | Renders `toolbar` component directly          | No                       |

#### Custom fonts

Text nodes are rendered to `<canvas>` via `ctx.fillText`, so any font that the
browser knows about is fair game. To register a custom font at runtime, use
the [`FontFace` API](https://developer.mozilla.org/en-US/docs/Web/API/FontFace):

```ts
const font = new FontFace("Caveat", "url(/fonts/Caveat.woff2)");
await font.load();
document.fonts.add(font);
```

Then pass `fontFamily: "Caveat"` to `textTool({ ... })`. Once the font is
added, the next `requestRender()` will paint with it. Webfonts loaded via
`@font-face` in your stylesheet work too — just make sure they're loaded
before drawing.

## Programmatic Control

`<orio-canvas>` exposes its API via `defineExpose`, so a template ref gives
you everything the tools have:

```vue
<script setup>
import { ref } from "vue";

const canvasRef = ref();

function addLabel() {
  canvasRef.value?.addNode({
    type: "text",
    x: 100,
    y: 100,
    data: {
      text: "Hello",
      fontSize: 32,
      fontFamily: "system-ui",
      color: "#0070f3",
      weight: "bold",
    },
  });
}
</script>

<template>
  <orio-canvas ref="canvasRef">
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>
  <orio-button @click="addLabel">Add label</orio-button>
</template>
```

### Exposed API

| Method / Property    | Type                          | Description                                |
| -------------------- | ----------------------------- | ------------------------------------------ |
| `addNode(node)`      | `(node) => CanvasNode`        | Add a node to the canvas.                  |
| `updateNode(id, patch)` | `(id, patch) => void`      | Update a node by id.                       |
| `removeNode(id)`     | `(id) => void`                | Remove a node by id.                       |
| `getNode(id)`        | `(id) => CanvasNode \| undefined` | Look up a node by id.                 |
| `clear()`            | `() => void`                  | Remove all nodes.                          |
| `nodes`              | `Ref<CanvasNode[]>`           | Reactive node list.                        |
| `getToolOptions(id)` | `(id) => T`                   | Read/write a tool's reactive options.      |
| `activeTool`         | `ComputedRef<CanvasTool \| null>` | Currently active tool (computed).     |
| `setActiveTool(id)`  | `(id: string \| null) => void` | Switch the active tool. Calls `onDeactivate`/`onActivate`. |
| `undo()`             | `() => void`                  | Undo the last action.                      |
| `redo()`             | `() => void`                  | Redo the last undone action.               |
| `canUndo`            | `ComputedRef<boolean>`        | Whether there's anything to undo.          |
| `canRedo`            | `ComputedRef<boolean>`        | Whether there's anything to redo.          |

## Undo / Redo

Built-in. Snapshots are captured automatically whenever the nodes array
changes (add, update, remove, clear). Pointer actions (draw strokes, drags)
are batched into a single undo step via `beginAction()` / `endAction()` —
the snapshot is taken on pointer up.

**Keyboard:** <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Cmd</kbd>+<kbd>Z</kbd> to
undo, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> /
<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> to redo. The stage must be
focused (it auto-focuses on pointer down). The active tool's `onKeyDown`
handler runs first — if it calls `e.preventDefault()`, the undo/redo shortcut
won't fire.

**Programmatic:**

```vue
<script setup>
import { ref } from "vue";

const canvasRef = ref();
</script>

<template>
  <orio-canvas ref="canvasRef" :max-history="100">
    <orio-canvas-toolbar />
    <orio-canvas-stage />
  </orio-canvas>

  <orio-button :disabled="!canvasRef?.canUndo" @click="canvasRef?.undo()">
    Undo
  </orio-button>
  <orio-button :disabled="!canvasRef?.canRedo" @click="canvasRef?.redo()">
    Redo
  </orio-button>
</template>
```

**Via tools (recommended):**

Just add `undoTool()` and `redoTool()` to your tools list — they render as
toolbar buttons with automatic disabled state and keyboard shortcut tooltips.

History is capped at `maxHistory` entries (default 50). Performing a new action
after undoing clears the redo stack — same as any editor.

## Internal Architecture

The canvas component is built from three composables that handle distinct
concerns. These are internal to the component — you interact with them via
props, `v-model`, and the exposed API.

### `useCanvasHistory`

Manages undo/redo with snapshot-based state tracking. Uses `JSON.parse(JSON.stringify())`
for deep cloning.

| Return          | Type                     | Description                                      |
| --------------- | ------------------------ | ------------------------------------------------ |
| `undo()`        | `() => void`             | Pop the last snapshot and restore it.             |
| `redo()`        | `() => void`             | Re-apply the last undone snapshot.                |
| `canUndo`       | `ComputedRef<boolean>`   | Whether the undo stack has entries.               |
| `canRedo`       | `ComputedRef<boolean>`   | Whether the redo stack has entries.               |
| `autoCommit()`  | `() => void`             | Commit if not inside a pointer action.            |
| `beginAction()` | `() => void`             | Mark the start of a pointer drag (batches commits). |
| `endAction()`   | `() => void`             | Mark the end of a pointer drag (commits once).    |
| `resetBaseline()` | `() => void`           | Set the current state as the baseline (after setup). |
| `onKeyDown(e)`  | `(e: KeyboardEvent) => void` | Handles <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>. |

### `useCanvasNodes`

CRUD operations for the node list. Every mutation calls the `onMutate` callback
which triggers `autoCommit` in the history composable. Node ids are generated
with `crypto.randomUUID()`. New nodes get `zIndex: nodes.value.length` by default.

| Return            | Type                                           | Description                    |
| ----------------- | ---------------------------------------------- | ------------------------------ |
| `addNode(node)`   | `(node: Omit<CanvasNode, "id">) => CanvasNode` | Create a node with auto-generated id. |
| `updateNode(id, patch)` | `(id: string, patch: Partial<CanvasNode>) => void` | Merge a patch into a node. |
| `getNode(id)`     | `(id: string) => CanvasNode \| undefined`      | Look up a node by id.          |
| `removeNode(id)`  | `(id: string) => void`                         | Remove a node by id.           |
| `clear()`         | `() => void`                                   | Remove all nodes.              |

### `useCanvasSetup`

Runs the `setup` prop callback once on `onMounted`. Supports both sync and async
functions. After setup completes, it calls `resetBaseline()` so the initial
nodes don't count as an undoable action.

### `useCanvasContext`

Provides the full canvas state to any descendant component via Vue's
`provide` / `inject`. The injection key is `Symbol("OrioCanvas")`. Throws
if called outside an `<orio-canvas>` parent.

```ts
import { useCanvasContext } from "@your-org/orio-ui";

const ctx = useCanvasContext();
// ctx.nodes, ctx.activeToolId, ctx.setActiveTool, ctx.getToolApi, ...
```

| Property          | Type                              | Description                            |
| ----------------- | --------------------------------- | -------------------------------------- |
| `tools`           | `Ref<CanvasTool[]>`               | All registered tools (computed from props). |
| `activeToolId`    | `Ref<string \| null>`             | Currently active tool id.              |
| `setActiveTool`   | `(id: string \| null) => void`    | Switch the active tool.                |
| `nodes`           | `Ref<CanvasNode[]>`               | Reactive node list (the `defineModel`). |
| `addNode`         | `(node) => CanvasNode`            | Add a node.                            |
| `updateNode`      | `(id, patch) => void`             | Update a node.                         |
| `removeNode`      | `(id) => void`                    | Remove a node.                         |
| `getNode`         | `(id) => CanvasNode \| undefined` | Look up a node.                        |
| `clear`           | `() => void`                      | Remove all nodes.                      |
| `requestRender`   | `() => void`                      | Schedule a canvas redraw via `requestAnimationFrame`. |
| `installRenderer` | `(fn: () => void) => void`        | Stage installs its render function here. |
| `getToolOptions`  | `(id) => T`                       | Read/write a tool's reactive options.  |
| `getToolApi`      | `(id) => CanvasToolApi<T>`        | Full tool API scoped to a tool id (cached per id). |
| `stageEl`         | `Ref<HTMLElement \| null>`        | The stage root DOM element.            |
| `size`            | `Ref<{ width, height }>`          | Canvas size in CSS pixels (computed from props). |
| `undo`            | `() => void`                      | Undo.                                  |
| `redo`            | `() => void`                      | Redo.                                  |
| `canUndo`         | `ComputedRef<boolean>`            | Undo availability.                     |
| `canRedo`         | `ComputedRef<boolean>`            | Redo availability.                     |
| `beginAction`     | `() => void`                      | Start a pointer action batch.          |
| `endAction`       | `() => void`                      | End a pointer action batch.            |
| `onKeyDown`       | `(e: KeyboardEvent) => void`      | Dispatches to active tool's `onKeyDown` first, then to history undo/redo handler. |

## Roadmap

Things explicitly **not** in v1 but the architecture is ready for:

- **Zoom & pan** — viewport transform; tools already work in canvas-space.

If you want this now, you can write it as a tool — see
[Extending Canvas](./extending.md).
