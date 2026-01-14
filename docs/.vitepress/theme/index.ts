import DefaultTheme from 'vitepress/theme';
import './custom.css';

// Import Layout wrapper
import Layout from './Layout.vue';

// Import CSS
import '../../../src/runtime/assets/css/main.css';

// Auto-import all components
const components = import.meta.glob('../../../src/runtime/components/**/*.vue', {
  eager: true,
});

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Register all components globally with Orio prefix
    for (const path in components) {
      const component = components[path];

      // Extract component path relative to components directory
      // e.g., "../../../src/runtime/components/gallery/Carousel.vue" -> ["gallery", "Carousel"]
      const pathParts = path.split('/components/')[1]?.replace('.vue', '').split('/') || [];

      // Build component name with proper nesting
      // e.g., ["gallery", "Carousel"] -> "GalleryCarousel"
      // e.g., ["gallery", "index"] -> "Gallery"
      // e.g., ["Button"] -> "Button"
      let componentName = pathParts
        .map(part => {
          // Capitalize first letter of each part
          return part === 'index' ? '' : part.charAt(0).toUpperCase() + part.slice(1);
        })
        .filter(Boolean)
        .join('');

      if (componentName && component.default) {
        // Register with Orio prefix (e.g., OrioButton, OrioGalleryCarousel)
        app.component(`Orio${componentName}`, component.default);
      }
    }
  },
};
