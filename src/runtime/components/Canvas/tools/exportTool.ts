import { defineCanvasTool } from "../types";
import type { CanvasNode, CanvasTool } from "../types";
import { getNodeBounds } from "./hitTest";
import ExportTooltip from "./tooltips/Export.vue";

/**
 * Image formats Canvas2D's `toBlob`/`toDataURL` natively supports across
 * modern browsers. Anything else (e.g. AVIF, TIFF) is encoder-dependent and
 * not guaranteed to round-trip.
 */
export type ExportFormat = "png" | "jpeg" | "webp";

const MIME_TYPES: Record<ExportFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export interface ExportResult {
  blob: Blob;
  dataURL: string;
  /** Same bytes as `blob`, wrapped as a `File` with the configured filename. */
  file: File;
  format: ExportFormat;
  /** Output pixel width (already multiplied by `scale`). */
  width: number;
  /** Output pixel height (already multiplied by `scale`). */
  height: number;
  filename: string;
}

export interface ExportOptions {
  /** Output format. Defaults to PNG. */
  format?: ExportFormat;
  /** Quality for lossy formats (jpeg, webp), 0–1. Ignored for PNG. */
  quality?: number;
  /** File name without extension. */
  filename?: string;
  /** Pixel scale relative to the visible canvas (1 = same size). */
  scale?: number;
  /**
   * If provided, receives the export result instead of (or alongside) the
   * download. Use to push the image into application state (e.g. a cart) or
   * upload to a backend. Async — the canvas awaits the returned Promise.
   */
  onExport?: (result: ExportResult) => void | Promise<void>;
  /**
   * Trigger a browser download. Defaults to `true` when `onExport` is not
   * provided, `false` when it is.
   */
  download?: boolean;
}

export interface ExportToolOptions
  extends
    Required<Pick<ExportOptions, "format" | "quality" | "filename" | "scale">>,
    Pick<ExportOptions, "onExport" | "download">,
    Record<string, unknown> {}

export const DEFAULT_EXPORT_OPTIONS: ExportToolOptions = {
  format: "png",
  quality: 0.92,
  filename: "canvas",
  scale: 1,
};

export interface CanvasSnapshot {
  nodes: CanvasNode[];
  tools: CanvasTool[];
  width: number;
  height: number;
}

/**
 * Render every node onto `target` using each owning tool's `render` function.
 * Mirrors Stage.vue's render loop but skips any active-tool overlay so the
 * export is a clean snapshot of the artwork.
 */
function renderNodesTo(
  target: CanvasRenderingContext2D,
  nodes: CanvasNode[],
  tools: CanvasTool[],
) {
  const toolMap = new Map(tools.map((t) => [t.id, t]));
  const ordered = [...nodes].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  for (const node of ordered) {
    const renderFn = toolMap.get(node.type)?.render;
    if (!renderFn) continue;
    if (node.rotation) {
      const b = getNodeBounds(node);
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      target.save();
      target.translate(cx, cy);
      target.rotate(node.rotation);
      target.translate(-cx, -cy);
      renderFn(target, node);
      target.restore();
    } else {
      renderFn(target, node);
    }
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Free the object URL after the browser has had a chance to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function resolveFormat(format?: ExportFormat | string): ExportFormat {
  return MIME_TYPES[format as ExportFormat] ? (format as ExportFormat) : "png";
}

function sanitizeFilename(name: string | undefined): string {
  return (name ?? "canvas").replace(/[^A-Za-z0-9._-]/g, "_") || "canvas";
}

/**
 * Render the snapshot to an offscreen canvas and produce a Blob/dataURL/File.
 * Pure: does not download or invoke callbacks.
 *
 * The offscreen canvas is sized exactly to `snapshot.width × snapshot.height`
 * (× `scale`), so any node geometry outside the canvas is naturally clipped —
 * the result captures only what would be visible on the live canvas.
 */
export async function renderCanvasSnapshot(
  snapshot: CanvasSnapshot,
  options: ExportOptions = {},
): Promise<ExportResult> {
  const format = resolveFormat(options.format);
  const quality = options.quality ?? DEFAULT_EXPORT_OPTIONS.quality;
  const scale = options.scale ?? DEFAULT_EXPORT_OPTIONS.scale;

  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error(
      `[orio-canvas] invalid export option: scale must be a finite number > 0 (got ${scale})`,
    );
  }
  if (
    format !== "png" &&
    options.quality !== undefined &&
    (!Number.isFinite(quality) || quality < 0 || quality > 1)
  ) {
    throw new Error(
      `[orio-canvas] invalid export option: quality must be a finite number in [0, 1] (got ${quality})`,
    );
  }

  const mime = MIME_TYPES[format];
  const ext = format === "jpeg" ? "jpg" : format;
  const filename = `${sanitizeFilename(options.filename)}.${ext}`;

  const out = document.createElement("canvas");
  const w = Math.max(1, Math.round(snapshot.width * scale));
  const h = Math.max(1, Math.round(snapshot.height * scale));
  out.width = w;
  out.height = h;
  const c = out.getContext("2d");
  if (!c) {
    throw new Error("[orio-canvas] failed to acquire 2D context for export");
  }
  c.scale(scale, scale);

  // JPEG has no alpha channel — paint a white background to avoid black.
  if (format === "jpeg") {
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, snapshot.width, snapshot.height);
  }

  renderNodesTo(c, snapshot.nodes, snapshot.tools);

  const encoderQuality = format === "png" ? undefined : quality;
  const blob = await new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (b) =>
        b
          ? resolve(b)
          : reject(new Error("[orio-canvas] toBlob returned null")),
      mime,
      encoderQuality,
    );
  });
  const dataURL = out.toDataURL(mime, encoderQuality);
  const file = new File([blob], filename, { type: mime });

  return { blob, dataURL, file, format, width: w, height: h, filename };
}

/**
 * Render the snapshot, then optionally hand the result to `onExport` and/or
 * trigger a browser download. Resolves with the result so callers can chain
 * additional work (uploads, state updates).
 */
export async function performExport(
  snapshot: CanvasSnapshot,
  options: ExportOptions = {},
): Promise<ExportResult> {
  const result = await renderCanvasSnapshot(snapshot, options);
  if (options.onExport) {
    await options.onExport(result);
  }
  const shouldDownload = options.download ?? !options.onExport;
  if (shouldDownload) {
    downloadBlob(result.blob, result.filename);
  }
  return result;
}

export function exportTool(options: Partial<ExportToolOptions> = {}) {
  return defineCanvasTool<never, ExportToolOptions>({
    id: "export",
    label: "Export",
    icon: "export",
    kind: "action",
    tooltip: ExportTooltip,
    defaultOptions: {
      ...DEFAULT_EXPORT_OPTIONS,
      ...options,
    },
    disabled(api) {
      return api.nodes.value.length === 0;
    },
    action(api) {
      const { width, height } = api.size();
      performExport(
        {
          nodes: api.nodes.value,
          tools: api.getTools(),
          width,
          height,
        },
        api.options,
      ).catch((err) => {
        console.error("[orio-canvas] export failed", err);
      });
    },
  });
}
