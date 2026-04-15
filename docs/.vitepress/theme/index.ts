import DefaultTheme from "vitepress/theme";
import "./custom.css";

// Import Layout wrapper
import Layout from "./Layout.vue";

// Import CSS
import "../../../src/runtime/assets/css/main.css";

// Import i18n
import { i18n } from "../../../src/runtime/i18n";

// Auto-import all components
const components = import.meta.glob(
  "../../../src/runtime/components/**/*.vue",
  {
    eager: true,
  },
);

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.use(i18n);
    // Register all components globally with Orio prefix
    for (const path in components) {
      const component = components[path];

      // Extract component path relative to the runtime components directory.
      // Splitting on the full marker avoids matching nested "components/"
      // folders (e.g. Canvas/components/Stage.vue).
      // e.g. ".../src/runtime/components/gallery/Carousel.vue" -> ["gallery", "Carousel"]
      // e.g. ".../src/runtime/components/Canvas/components/Stage.vue" -> ["Canvas", "components", "Stage"]
      const pathParts =
        path
          .split("src/runtime/components/")[1]
          ?.replace(".vue", "")
          .split("/") || [];

      // Build component name with proper nesting
      // e.g., ["gallery", "Carousel"] -> "GalleryCarousel"
      // e.g., ["gallery", "index"] -> "Gallery"
      // e.g., ["Button"] -> "Button"
      const componentName = pathParts
        .map((part) => {
          // Capitalize first letter of each part; skip "index" and
          // internal "components" segments so Canvas/components/Stage
          // registers as OrioCanvasStage, not OrioCanvasComponentsStage.
          if (part === "index" || part === "components") return "";
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .filter(Boolean)
        .join("");

      if (componentName && component.default) {
        // Register with Orio prefix (e.g., OrioButton, OrioGalleryCarousel)
        app.component(`Orio${componentName}`, component.default);
      }
    }
  },
};
