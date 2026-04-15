import { defineCanvasTool } from "../types";
import Redo from "./tooltips/Redo.vue";

export function redoTool() {
  return defineCanvasTool({
    id: "redo",
    label: "Redo",
    icon: "redo",
    kind: "action",
    tooltip: Redo,
    action(api) {
      api.redo();
    },
    disabled(api) {
      return !api.canRedo.value;
    },
  });
}
