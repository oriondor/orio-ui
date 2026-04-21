import { onMounted } from "vue";
import type { CanvasToolApi } from "../types";

export function useCanvasSetup(
  setupFn: ((api: CanvasToolApi) => void | Promise<void>) | undefined,
  opts: {
    getToolApi: () => CanvasToolApi;
    resetBaseline: () => void;
  },
) {
  onMounted(() => {
    if (!setupFn) return;
    const api = opts.getToolApi();
    const done = () => {
      opts.resetBaseline();
      // Image nodes added during setup rely on imageTool's render cache which
      // decodes images asynchronously. Schedule a re-render so they appear
      // once decoded instead of staying as placeholders until user interaction.
      requestAnimationFrame(() => api.requestRender());
    };
    const result = setupFn(api);
    if (result && typeof result.then === "function") {
      result.then(done, (err) => {
        console.error("[Canvas] setup() rejected:", err);
      });
    } else {
      done();
    }
  });
}
