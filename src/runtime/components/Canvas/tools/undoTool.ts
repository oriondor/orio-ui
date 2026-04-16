import { defineCanvasTool } from "../types";
import UndoTooltip from "./tooltips/Undo.vue";

export function undoTool() {
  return defineCanvasTool({
    id: "undo",
    label: "Undo",
    icon: "undo",
    kind: "action",
    tooltip: UndoTooltip,
    action(api) {
      api.undo();
    },
    disabled(api) {
      return !api.canUndo.value;
    },
  });
}
