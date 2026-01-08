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
      const componentName = path
        .split('/')
        .pop()
        ?.replace('.vue', '');

      if (componentName && component.default) {
        // Register with Orio prefix (e.g., OrioButton)
        app.component(`Orio${componentName}`, component.default);
      }
    }
  },
};
