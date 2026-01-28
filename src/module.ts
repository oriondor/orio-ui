import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
} from "@nuxt/kit";
import { THEME_DEFAULTS, COOKIE_NAMES } from "./runtime/constants/theme";

// Blocking script to prevent theme flash - runs before Vue hydration
const themeScript = `
(function() {
  var cookies = document.cookie.split(';').reduce(function(acc, c) {
    var parts = c.trim().split('=');
    if (parts.length === 2) acc[parts[0]] = parts[1];
    return acc;
  }, {});
  var theme = cookies['${COOKIE_NAMES.theme}'] || '${THEME_DEFAULTS.theme}';
  var mode = cookies['${COOKIE_NAMES.mode}'] || '${THEME_DEFAULTS.mode}';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-mode', mode);
})();
`;

export default defineNuxtModule({
  meta: {
    name: "orio-ui",
    configKey: "orioUi",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
  },
  defaults: {},
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Add CSS
    nuxt.options.css.push(resolver.resolve("./runtime/assets/css/main.css"));

    // Add blocking script to prevent theme flash
    nuxt.options.app.head.script = nuxt.options.app.head.script || [];
    nuxt.options.app.head.script.unshift({
      innerHTML: themeScript,
      tagPosition: "head",
    });

    // Register components with Orio prefix
    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: "Orio",
      pathPrefix: true,
    });

    // Register composables
    addImportsDir(resolver.resolve("./runtime/composables"));
  },
});
