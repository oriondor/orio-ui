---
kind: component
category: Layout & containers
purpose: canvas, drawing board, whiteboard, sketch, freeform editor, pluggable tools
short: pannable workspace with pluggable tools and detached toolbar registry
invariants: true
---

# Canvas — agent-only invariants

Read this before integrating `<orio-canvas>` into a consumer app. Public API
lives in `docs/components/canvas/`.

## Invariants

- **`name` prop is required.** It registers this canvas instance in the
  module-level `canvasRegistry` (`./registry.ts`), which is how detached
  toolbars find it. Without a `name`, a toolbar rendered outside the canvas
  subtree cannot bind to it.
- **Detached toolbar uses `canvas="<name>"`, not `provide/inject`.** Render
  `<orio-canvas-toolbar canvas="editor" />` anywhere in the app — even in a
  sibling subtree — and it resolves the context via the registry. Toolbars
  nested as children of `<orio-canvas>` resolve via `useCanvasContext()`
  inject and do not need the prop.
- **Tools are pluggable, nothing ships by default.** Pass `:tools="[drawTool(),
  textTool(), ...]"`. There are no implicit defaults.
- **Tool factories are functions, not singletons.** Call `drawTool()` per
  canvas instance — closure state (e.g. the in-progress stroke id) must not be
  shared across canvases on the same page.
- **`v-model:nodes` is the persistence boundary.** Serialize the array to JSON
  for save/load. Unknown node types (tools not yet registered on hydrate) are
  silently skipped on render — register the tool, then re-render.
- **`frozen: true` nodes** are protected from `eraseTool`, `moveTool`,
  `highlightTool` and future selection tools. Drawing/text passes ignore the
  flag.
- **`setup(api)` runs once on mount** with the full tool API. Use it to seed
  initial nodes (frozen background images, watermark, etc.). It can add node
  types whose tools are not in the user-facing `tools` prop — useful for
  display-only nodes.

## Gotchas

- Tool `id` doubles as the node `type`. Two tools with the same id collide.
- `setup` may be async; nodes added inside resolve before the first render.
- Undo snapshot is finalized on `pointerUp` for `drawTool` — mid-stroke is not
  a history step. If you script node creation outside a tool, call
  `requestRender()` and rely on the next user action to checkpoint.
- Custom fonts: no bundled loader. Caller is responsible for `document.fonts`
  / `FontFace` loading before `textTool` renders that font.

## Quick reference

```vue
<orio-canvas
  name="editor"
  v-model:nodes="nodes"
  :tools="[drawTool(), textTool(), eraseTool(), undoTool()]"
  :width="800"
  :height="500"
  :setup="(api) => api.addNode({ type: 'bg', frozen: true, ... })"
/>

<!-- elsewhere in the app -->
<orio-canvas-toolbar canvas="editor" />
```

## Where things live

- Types & `defineCanvasTool` → `./types.ts`
- Context (`provide`/`inject`, `useCanvasContext`) → `./context.ts`
- Registry (module-level Map for detached toolbars) → `./registry.ts`
- Built-in tools → `./tools/*.ts`
- Full spec → `./REQUIREMENTS.md`
