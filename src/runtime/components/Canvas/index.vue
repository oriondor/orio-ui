<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
} from "vue";
import { CANVAS_CONTEXT, type CanvasContext } from "./context";
import { canvasRegistry } from "./registry";
import type { CanvasNode, CanvasTool, CanvasToolApi } from "./types";
import { useCanvasHistory } from "./composables/useCanvasHistory";
import { useCanvasNodes } from "./composables/useCanvasNodes";
import { useCanvasSetup } from "./composables/useCanvasSetup";
import Stage from "./components/Stage.vue";
import Toolbar from "./components/Toolbar.vue";
import {
  performExport,
  type ExportOptions,
  type ExportResult,
  type ExportToolOptions,
} from "./tools/exportTool";

export interface CanvasProps {
  /**
   * Unique name for this canvas instance. Required so detached toolbars and
   * other UI can bind to this canvas via the `canvas` prop, e.g.
   * `<orio-canvas-toolbar canvas="editor" />` rendered anywhere in the app.
   */
  name: string;
  /** Tools available to the canvas. Empty by default — specify all tools explicitly. */
  tools?: CanvasTool[];
  /** Drawing surface width in CSS pixels. */
  width?: number;
  /** Drawing surface height in CSS pixels. */
  height?: number;
  /** Initial active tool id. Defaults to the first tool. */
  defaultTool?: string;
  /** CSS background applied to the stage wrapper. */
  background?: string;
  /** Maximum undo history depth. */
  maxHistory?: number;
  /**
   * Called once on mount with the full tool API. Use it to seed the canvas
   * with initial nodes (images, text, shapes). Nodes added here can be
   * `frozen: true` to lock them from user interaction.
   *
   * The toolbar controls what the *user* can do — setup can add any node
   * type regardless of which tools are registered.
   */
  setup?: (api: CanvasToolApi) => void | Promise<void>;
}

const props = withDefaults(defineProps<CanvasProps>(), {
  tools: () => [],
  width: 800,
  height: 500,
  defaultTool: undefined,
  background: "transparent",
  maxHistory: 50,
  setup: undefined,
});

const nodes = defineModel<CanvasNode[]>("nodes", { default: () => [] });

const toolsRef = computed(() => props.tools);
const size = computed(() => ({ width: props.width, height: props.height }));
const stageEl = ref<HTMLElement | null>(null);
const cursorOverride = ref<string | null>(null);
function setCursor(cursor: string | null) {
  cursorOverride.value = cursor;
}

const activeToolId = ref<string | null>(
  props.defaultTool ??
    props.tools.find((t) => !t.kind || t.kind === "interaction")?.id ??
    null,
);

// Per-tool reactive options, keyed by tool id.
const toolOptionsMap = reactive<Record<string, Record<string, unknown>>>({});

watch(
  toolsRef,
  (list) => {
    for (const t of list) {
      if (!toolOptionsMap[t.id]) {
        toolOptionsMap[t.id] = reactive({ ...(t.defaultOptions ?? {}) });
      }
    }
  },
  { immediate: true },
);

function getToolOptions<T extends Record<string, unknown>>(id: string): T {
  if (!toolOptionsMap[id]) toolOptionsMap[id] = reactive({});
  return toolOptionsMap[id] as T;
}

// Renderer — stage installs its render function here.
const rendererFn = shallowRef<() => void>(() => {});
function requestRender() {
  rendererFn.value();
}
function installRenderer(fn: () => void) {
  rendererFn.value = fn;
}

// History
const {
  undo,
  redo,
  canUndo,
  canRedo,
  autoCommit,
  beginAction,
  endAction,
  resetBaseline,
  onKeyDown,
} = useCanvasHistory(nodes, {
  maxHistory: () => props.maxHistory,
  requestRender,
});

// Nodes
const { addNode, updateNode, getNode, removeNode, clear } = useCanvasNodes(
  nodes,
  { onMutate: autoCommit },
);

// Tool API — cached per tool id so we don't allocate on every pointer event.
const toolApiCache = new Map<string, CanvasToolApi>();

function getToolApi<T extends Record<string, unknown>>(
  id: string,
): CanvasToolApi<T> {
  let api = toolApiCache.get(id);
  if (!api) {
    api = {
      options: getToolOptions(id),
      nodes,
      addNode,
      updateNode,
      removeNode,
      getNode,
      clear,
      requestRender,
      stageEl: () => stageEl.value,
      size: () => ({ width: props.width, height: props.height }),
      undo,
      redo,
      canUndo,
      canRedo,
      getToolOptions,
      getTools: () => props.tools,
      setCursor,
    };
    toolApiCache.set(id, api);
  }
  return api as CanvasToolApi<T>;
}

function setActiveTool(id: string | null) {
  if (id === activeToolId.value) return;
  const prev = props.tools.find((t) => t.id === activeToolId.value);
  prev?.onDeactivate?.(getToolApi(prev.id));
  cursorOverride.value = null;
  activeToolId.value = id;
  const next = id ? props.tools.find((t) => t.id === id) : null;
  next?.onActivate?.(getToolApi(next.id));
}

function handleKeyDown(e: KeyboardEvent) {
  const tool = props.tools.find((t) => t.id === activeToolId.value);
  if (tool?.onKeyDown) {
    tool.onKeyDown(e, getToolApi(tool.id));
    if (e.defaultPrevented) return;
  }
  onKeyDown(e);
}

function exportCanvas(overrides: ExportOptions = {}): Promise<ExportResult> {
  const toolOpts = getToolOptions<Partial<ExportToolOptions>>("export");
  return performExport(
    {
      nodes: nodes.value,
      tools: props.tools,
      width: props.width,
      height: props.height,
    },
    { ...toolOpts, ...overrides },
  );
}

const context: CanvasContext = {
  tools: toolsRef,
  activeToolId,
  setActiveTool,
  nodes,
  addNode,
  updateNode,
  removeNode,
  getNode,
  clear,
  requestRender,
  installRenderer,
  getToolOptions,
  getToolApi,
  stageEl,
  size,
  undo,
  redo,
  canUndo,
  canRedo,
  beginAction,
  endAction,
  onKeyDown: handleKeyDown,
  cursorOverride,
  setCursor,
  exportCanvas,
};

provide(CANVAS_CONTEXT, context);

let registeredName: string | null = null;

watch(
  () => props.name,
  (newName, oldName) => {
    if (oldName && canvasRegistry.get(oldName) === context) {
      canvasRegistry.delete(oldName);
    }
    if (import.meta.env.DEV && canvasRegistry.has(newName)) {
      console.warn(
        `[orio-canvas] duplicate canvas name "${newName}" — ` +
          `detached toolbars bound to this name will resolve to the most ` +
          `recently mounted canvas.`,
      );
    }
    canvasRegistry.set(newName, context);
    registeredName = newName;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (registeredName && canvasRegistry.get(registeredName) === context) {
    canvasRegistry.delete(registeredName);
  }
});

useCanvasSetup(props.setup, {
  getToolApi: () => getToolApi("__setup__"),
  resetBaseline,
});

const activeTool = computed(
  () => props.tools.find((t) => t.id === activeToolId.value) ?? null,
);

defineExpose({
  activeTool,
  setActiveTool,
  addNode,
  updateNode,
  removeNode,
  clear,
  nodes,
  getToolOptions,
  undo,
  redo,
  canUndo,
  canRedo,
  exportCanvas,
});
</script>

<template>
  <div class="canvas-root" :style="{ background }">
    <slot>
      <Toolbar :canvas="name" />
      <Stage />
    </slot>
  </div>
</template>

<style scoped>
.canvas-root {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: fit-content;
}
</style>
