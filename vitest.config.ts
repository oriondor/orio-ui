import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      exclude: ["docs/**", "playground/**", "dist/**", "node_modules/**"],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
      },
    },
  },
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
