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

export interface ExportToolOptions extends Record<string, unknown> {
  /** Output format. Defaults to PNG. */
  format: ExportFormat;
  /** Quality for lossy formats (jpeg, webp), 0–1. Ignored for PNG. */
  quality: number;
  /** File name without extension. */
  filename: string;
  /** Pixel scale relative to the visible canvas (1 = same size). */
  scale: number;
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
  const ordered = [...nodes].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
  );
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

export function exportTool(options: Partial<ExportToolOptions> = {}) {
  return defineCanvasTool<never, ExportToolOptions>({
    id: "export",
    label: "Export",
    icon: "export",
    kind: "action",
    tooltip: ExportTooltip,
    defaultOptions: {
      format: "png",
      quality: 0.92,
      filename: "canvas",
      scale: 1,
      ...options,
    },
    disabled(api) {
      return api.nodes.value.length === 0;
    },
    action(api) {
      const { quality, scale } = api.options;
      const { width, height } = api.size();
      const knownFormat: ExportFormat =
        MIME_TYPES[api.options.format as ExportFormat]
          ? (api.options.format as ExportFormat)
          : "png";
      const mime = MIME_TYPES[knownFormat];
      const ext = knownFormat === "jpeg" ? "jpg" : knownFormat;
      const sanitized =
        api.options.filename.replace(/[^A-Za-z0-9._-]/g, "_") || "canvas";

      // Re-render to an offscreen canvas at the requested scale. Doing a fresh
      // render (rather than copying the live canvas) keeps the export free of
      // any active-tool overlay handles.
      const out = document.createElement("canvas");
      const w = Math.max(1, Math.round(width * scale));
      const h = Math.max(1, Math.round(height * scale));
      out.width = w;
      out.height = h;
      const c = out.getContext("2d");
      if (!c) return;
      c.scale(scale, scale);

      // JPEG has no alpha channel — paint a white background to avoid black.
      if (knownFormat === "jpeg") {
        c.fillStyle = "#ffffff";
        c.fillRect(0, 0, width, height);
      }

      renderNodesTo(c, api.nodes.value, api.getTools());

      out.toBlob(
        (blob) => {
          if (!blob) return;
          downloadBlob(blob, `${sanitized}.${ext}`);
        },
        mime,
        knownFormat === "png" ? undefined : quality,
      );
    },
  });
}
