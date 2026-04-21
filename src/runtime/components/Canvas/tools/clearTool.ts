import { defineCanvasTool } from "../types";
import ClearTooltip from "./tooltips/Clear.vue";

export function clearTool() {
  return defineCanvasTool({
    id: "clear",
    label: "Clear",
    kind: "action",
    tooltip: ClearTooltip,
    action(api) {
      api.clear();
    },
    disabled(api) {
      return api.nodes.value.every((n) => n.frozen);
    },
  });
}
