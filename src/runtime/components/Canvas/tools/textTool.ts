import { defineCanvasTool } from "../types";
import TextTooltip from "./tooltips/Text.vue";

export interface TextToolOptions extends Record<string, unknown> {
  fontSize: number;
  fontFamily: string;
  color: string;
  weight: "normal" | "bold" | number;
}

export interface TextNodeData {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  weight: TextToolOptions["weight"];
}

export function textTool(options: Partial<TextToolOptions> = {}) {
  return defineCanvasTool<TextNodeData, TextToolOptions>({
    id: "text",
    label: "Text",
    icon: "text",
    cursor: "text",
    tooltip: TextTooltip,
    defaultOptions: {
      fontSize: 24,
      fontFamily: "system-ui, sans-serif",
      color: "#111111",
      weight: "normal",
      ...options,
    },
    onPointerDown(e, api) {
      const stage = api.stageEl();
      if (!stage) return;
      // Don't spawn a new editor if the user clicked an existing overlay.
      if (
        (e.originalEvent.target as HTMLElement)?.closest?.(
          ".canvas-text-editor",
        )
      ) {
        return;
      }

      const input = document.createElement("input");
      input.type = "text";
      input.className = "canvas-text-editor";
      input.style.position = "absolute";
      input.style.left = `${e.x}px`;
      input.style.top = `${e.y}px`;
      input.style.transform = "translateY(-50%)";
      input.style.font = `${api.options.weight} ${api.options.fontSize}px ${api.options.fontFamily}`;
      input.style.color = api.options.color;
      input.style.background = "transparent";
      input.style.border = "1px dashed currentColor";
      input.style.outline = "none";
      input.style.padding = "0 2px";
      input.style.minWidth = "1ch";
      input.style.zIndex = "10";

      // Snapshot the current options so later option changes don't mutate
      // this specific text node.
      const snapshot: TextToolOptions = { ...api.options };

      stage.appendChild(input);
      requestAnimationFrame(() => input.focus());

      let committed = false;
      const commit = () => {
        if (committed) return;
        committed = true;
        const text = input.value;
        input.remove();
        if (!text.trim()) return;
        api.addNode({
          type: "text",
          x: e.x,
          y: e.y,
          data: {
            text,
            fontSize: snapshot.fontSize,
            fontFamily: snapshot.fontFamily,
            color: snapshot.color,
            weight: snapshot.weight,
          },
        });
        api.requestRender();
      };

      const cancel = () => {
        if (committed) return;
        committed = true;
        input.remove();
      };

      input.addEventListener("blur", commit);
      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          input.blur();
        } else if (ev.key === "Escape") {
          ev.preventDefault();
          input.removeEventListener("blur", commit);
          cancel();
        }
      });
    },
    hitTest(node, point, radius) {
      const { text, fontSize } = node.data;
      if (!text) return false;
      // Approximate bounding box using a scratch canvas measurement.
      const estimatedWidth = text.length * fontSize * 0.6;
      const halfHeight = fontSize / 2;
      return (
        point.x + radius >= node.x &&
        point.x - radius <= node.x + estimatedWidth &&
        point.y + radius >= node.y - halfHeight &&
        point.y - radius <= node.y + halfHeight
      );
    },
    render(ctx, node) {
      const { text, fontSize, fontFamily, color, weight } = node.data;
      if (!text) return;
      ctx.save();
      ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = "middle";
      ctx.fillText(text, node.x, node.y);
      ctx.restore();
    },
  });
}
