import { defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
  meta: {
    name: 'orio-ui',
    configKey: 'orioUi',
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0',
    },
  },
  defaults: {},
  setup() {
    // Module setup is handled by the layer (nuxt.config.ts)
    // This module entry is required for the build process
  },
});
