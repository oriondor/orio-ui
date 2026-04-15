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
    const result = setupFn(opts.getToolApi());
    if (result && typeof result.then === "function") {
      result.then(
        () => opts.resetBaseline(),
        (err) => {
          console.error("[Canvas] setup() rejected:", err);
        },
      );
    } else {
      opts.resetBaseline();
    }
  });
}
