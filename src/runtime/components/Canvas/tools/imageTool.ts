import { defineCanvasTool } from "../types";
import type { CanvasNode, CanvasToolApi } from "../types";
import ImageTooltip from "./tooltips/Image.vue";

export interface ImageNodeData {
  /** Object URL or data URL the image was loaded from. */
  src: string;
  /** Original natural dimensions — preserved for aspect-ratio resizing. */
  naturalWidth: number;
  naturalHeight: number;
  /** Optional alt text. */
  alt?: string;
}

export interface ImageToolOptions extends Record<string, unknown> {
  /** `accept` attribute on the file picker. Defaults to all canvas-renderable images. */
  accept: string;
  /** Largest side (CSS pixels) when an uploaded image is placed. */
  maxSize: number;
  /** Allow multiple files in one upload. */
  multiple: boolean;
}

const DEFAULT_ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif,image/bmp";

/**
 * In-memory image cache shared across renders. Keyed by `src` so identical
 * URLs only ever decode once. Loading is async — `render` paints a placeholder
 * until `img.complete` is true, or a "broken image" placeholder when `failed`.
 */
interface CacheEntry {
  img: HTMLImageElement;
  failed: boolean;
}

function makeCache() {
  return new Map<string, CacheEntry>();
}

/**
 * Read a File into a data URL. We prefer data URLs over object URLs so the
 * canvas can be persisted and re-rehydrated without losing references.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export function imageTool(options: Partial<ImageToolOptions> = {}) {
  const cache = makeCache();
  // Captured the first time any tool callback runs — used by the async load
  // path to trigger a redraw once an image's pixels are available.
  let latestApi: CanvasToolApi<ImageToolOptions> | null = null;

  function ensureLoaded(src: string): CacheEntry {
    const existing = cache.get(src);
    if (existing) return existing;
    const img = new Image();
    img.crossOrigin = "anonymous";
    const entry: CacheEntry = { img, failed: false };
    img.onload = () => latestApi?.requestRender();
    img.onerror = () => {
      entry.failed = true;
      // Log once per failed src via the cache — subsequent renders skip.
      console.warn(`[imageTool] Failed to load image: ${src}`);
      latestApi?.requestRender();
    };
    img.src = src;
    cache.set(src, entry);
    return entry;
  }

  /**
   * Present a file picker and resolve with the chosen files. Guards against
   * older WebViews that fire neither `change` nor `cancel` when the user
   * dismisses the dialog by listening for `focus` as a fallback.
   */
  function pickFiles(input: HTMLInputElement): Promise<FileList | null> {
    return new Promise((resolve) => {
      let settled = false;
      let focusTimer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        input.onchange = null;
        // Cast because `oncancel` isn't in older DOM lib typings.
        (input as unknown as { oncancel: (() => void) | null }).oncancel =
          null;
        window.removeEventListener("focus", onFocus);
        if (focusTimer !== null) {
          clearTimeout(focusTimer);
          focusTimer = null;
        }
      };
      const settle = (value: FileList | null) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };
      const onFocus = () => {
        // Debounce so `change` has a chance to fire first on browsers that
        // deliver focus before the file list.
        focusTimer = setTimeout(() => {
          if (!settled) {
            settle(input.files && input.files.length > 0 ? input.files : null);
          }
        }, 300);
      };

      input.onchange = () => settle(input.files);
      (input as unknown as { oncancel: (() => void) | null }).oncancel = () =>
        settle(null);
      window.addEventListener("focus", onFocus);
      input.click();
    });
  }

  async function pickAndAdd(api: CanvasToolApi<ImageToolOptions>) {
    latestApi = api;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = api.options.accept;
    input.multiple = api.options.multiple;
    const file = await pickFiles(input);
    if (!file || file.length === 0) return;

    const { width: cw, height: ch } = api.size();
    for (const f of Array.from(file)) {
      try {
        const src = await fileToDataUrl(f);
        const img = await decodeImage(src);
        cache.set(src, { img, failed: false });

        const max = api.options.maxSize;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;

        api.addNode({
          type: "image",
          x: (cw - w) / 2,
          y: (ch - h) / 2,
          width: w,
          height: h,
          data: {
            src,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            alt: f.name,
          } satisfies ImageNodeData,
        });
      } catch {
        // Skip files that fail to decode.
      }
    }
  }

  return defineCanvasTool<ImageNodeData, ImageToolOptions>({
    id: "image",
    label: "Image",
    icon: "image",
    kind: "action",
    tooltip: ImageTooltip,
    defaultOptions: {
      accept: DEFAULT_ACCEPT,
      maxSize: 320,
      multiple: false,
      ...options,
    },
    action(api) {
      latestApi = api;
      void pickAndAdd(api);
    },
    render(ctx, node) {
      const data = node.data;
      if (!data?.src) return;
      const w = node.width ?? data.naturalWidth;
      const h = node.height ?? data.naturalHeight;
      const entry = ensureLoaded(data.src);
      if (!entry.failed && entry.img.complete && entry.img.naturalWidth > 0) {
        ctx.drawImage(entry.img, node.x, node.y, w, h);
        return;
      }
      // Placeholder while decoding or broken-image indicator on failure.
      ctx.save();
      ctx.fillStyle = entry.failed
        ? "rgba(200, 0, 0, 0.08)"
        : "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(node.x, node.y, w, h);
      ctx.strokeStyle = entry.failed
        ? "rgba(200, 0, 0, 0.3)"
        : "rgba(0, 0, 0, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(node.x, node.y, w, h);
      ctx.restore();
    },
  });
}
