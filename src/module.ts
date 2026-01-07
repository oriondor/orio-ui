import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
} from '@nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'orio-ui',
    configKey: 'orioUi',
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0',
    },
  },
  defaults: {},
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Add CSS
    nuxt.options.css.push(resolver.resolve('./runtime/assets/css/main.css'));

    // Register components with Orio prefix
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      prefix: 'Orio',
      pathPrefix: true,
    });

    // Register composables
    addImportsDir(resolver.resolve('./runtime/composables'));
  },
});
