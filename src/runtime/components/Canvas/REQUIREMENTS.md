# Canvas — Internal Requirements

Scratchpad for the Canvas component. Not shipped to users, not imported anywhere.
Update as scope evolves.

## Vision

A **tiptap-flavored, headless-ish canvas playground**. The core owns the
`<canvas>`, node storage, rendering loop and pointer dispatch. Everything
else — tools, toolbars, node kinds, UI chrome — is pluggable by the consumer.

## Extensibility goals

- Consumers can define a tool in userland (`defineCanvasTool({...})`) and drop
  it into `<orio-canvas :tools="[...]" />`.
- Tools own:
  - their id (also the node type they produce),
  - pointer handlers,
  - the render function for nodes of their type,
  - reactive per-tool options (brush size, color, font family, ...),
  - optional icon and label used by the default toolbar.
- Consumers can replace the toolbar UI entirely via the `toolbar` slot, or
  replace individual tool buttons via the default slot of
  `<orio-canvas-tool-button>`.
- Consumers can replace the stage too — `<orio-canvas-stage>` is a standalone
  child; advanced users could write their own stage using `useCanvasContext`.

## Data model

- `CanvasNode` = `{ id, type, x, y, width?, height?, rotation?, frozen?, zIndex?, data }`
- `nodes` is the single source of truth (reactive array), v-modelable as
  `v-model:nodes`.
- Rendering order is `zIndex` ascending (stable). New nodes get an increasing
  zIndex by default.
- `frozen` is a flag only. Interaction tools (`moveTool`, `eraseTool`,
  `highlightTool`) skip frozen nodes; strokes and text are painted regardless.

## Rendering

- Single `<canvas>` element. 2D context. DPR-scaled.
- Full redraw on every `requestRender()`, batched through `requestAnimationFrame`.
- Tools render their own node type via `render(ctx, node)`. Unknown node types
  are silently skipped — lets consumers hydrate a saved doc gradually as tools
  register themselves.

## Tool API surface

```ts
CanvasTool<TNodeData, TOptions> = {
  id: string
  label?: string
  icon?: string               // orio-icon registry name
  cursor?: string             // CSS cursor applied to stage when active
  kind?: "interaction" | "action" | "widget"
  action?(api)                // for action tools — fired on button click
  disabled?(api) => boolean   // for action tools — reactive disabled state
  toolbar?: Component         // for widget tools — rendered instead of button
  defaultOptions?: TOptions
  onPointerDown?(e, api)
  onPointerMove?(e, api)
  onPointerUp?(e, api)
  onActivate?(api)
  onDeactivate?(api)
  render?(ctx, node)
}
```

`api: CanvasToolApi<TOptions>` = `{ options, nodes, addNode, updateNode,
removeNode, getNode, clear, requestRender, stageEl(), size(), undo, redo,
canUndo, canRedo, getToolOptions }`.

Tool options live on the context keyed by tool id. Mutating `api.options`
should be reactive so overlays or settings panels can reflect changes.

### Tool kinds

- **interaction** (default) — standard pointer tool, becomes active on click.
- **action** — fires `action(api)` on click, never becomes active. Button
  shows disabled state from `disabled(api)`.
- **widget** — renders a custom `toolbar` Vue component instead of a button.

## Scope v1 (SHIPPING)

- Core canvas component + Stage + Toolbar + ToolButton.
- No default tools — consumer specifies everything explicitly.
- `drawTool()` — freehand pen, per-tool color/size/opacity/brush. Uses
  quadratic smoothing between points.
- `textTool()` — click to place, inline `<input>` overlay for editing, commits
  on Enter/blur, Escape cancels. Options: `fontSize`, `fontFamily`, `color`,
  `weight`.
- `eraseTool()` — erases non-frozen nodes under pointer. Uses per-tool
  `hitTest` for accurate detection, falls back to bounding box.
- `moveTool()` — drags non-frozen nodes; `[`/`]` keys reorder zIndex of
  hovered/dragged node. Shares hit-testing via `tools/hitTest.ts`.
- `highlightTool()` — hover overlay showing the top-most hit node's bounds.
- `undoTool()`, `redoTool()`, `clearTool()` — action tools.
- `colorPickerTool()` — widget tool, native color input, syncs to targets.
- `setup` prop — callback on mount to seed initial nodes. Frozen nodes are
  protected from eraser and future selection tools.
- `hitTest` optional method on CanvasTool for spatial queries.
- Undo / redo — history stack on the nodes array, Ctrl+Z / Ctrl+Shift+Z
  keyboard support, `maxHistory` prop (default 50). drawTool finalizes stroke
  on pointerUp so the full stroke is captured as one snapshot.
- Vitepress docs covering usage, slots, and how to author a custom tool.
- Icons added to `icon-registry.ts`: `pencil`, `text`, `undo`, `redo`,
  `eraser`.

## Out of scope v1 (stubbed in types / docs only)

- Image tool — image nodes need loading/caching + upload hookup. Add as
  `imageTool()` next iteration.
- ~~Move~~ — shipped in v1 via `moveTool` (reuses shared `hitTest.ts`).
- Selection / resize / rotate — needs a marquee-select tool and bounds
  handles. Not in v1.
- Freeze toggle UI — data model supports `frozen`, but there is no tool to
  toggle it yet. Add when selection lands.
- Custom font loading — doc will explain using the `FontFace` API; no bundled
  loader.
- ~~Undo/redo~~ — shipped in v1.
- Save / load — `v-model:nodes` plus JSON is enough for now; real persistence
  (including bitmap snapshots) comes later.
- Zoom / pan — stage is fixed-size in v1. Add a viewport transform layer
  later; tools should keep working because they already operate on
  canvas-space coordinates.

## Decisions / rationale

- **Per-tool factory (`drawTool()` vs a singleton object):** each call creates
  fresh closure state (e.g. the "currently drawing" node id), so two canvases
  on the same page don't trample each other.
- **`activeId` stored in closure, not context:** it's a transient interaction
  state owned by the tool, not something any other component cares about.
- **`stageEl` as a context ref:** text tool needs a DOM parent to mount its
  inline editor, and future tools (image crop, handles) will need it too.
- **Not using `<canvas>` per node:** single canvas is simpler, renders faster,
  and matches the "raster playground" feel. Trade-off: no layer-level hit
  testing — we'll need to maintain an index when selection arrives.

## File layout

```text
Canvas/
├── REQUIREMENTS.md         <- this file
├── index.vue               <- <orio-canvas>
├── types.ts                <- CanvasNode, CanvasTool, defineCanvasTool
├── context.ts              <- provide/inject + useCanvasContext
├── components/
│   ├── Stage.vue           <- <orio-canvas-stage>
│   ├── Toolbar.vue         <- <orio-canvas-toolbar>
│   └── ToolButton.vue      <- <orio-canvas-tool-button>
├── composables/
│   ├── useCanvasHistory.ts <- undo/redo stack
│   ├── useCanvasNodes.ts   <- add/update/remove/clear
│   └── useCanvasSetup.ts   <- onMounted setup() + baseline
└── tools/
    ├── drawTool.ts
    ├── textTool.ts
    ├── eraseTool.ts
    ├── moveTool.ts
    ├── highlightTool.ts
    ├── undoTool.ts
    ├── redoTool.ts
    ├── clearTool.ts
    ├── colorPickerTool.ts
    ├── hitTest.ts          <- shared findTopNode / renderHighlightRect
    ├── ColorPickerWidget.vue
    └── tooltips/           <- per-tool <orio-view-text> + key binds
```

Auto-import prefix is `Orio`, so nested files become `<orio-canvas-stage>`,
`<orio-canvas-toolbar>`, `<orio-canvas-tool-button>`.
