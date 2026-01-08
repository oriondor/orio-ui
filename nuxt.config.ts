// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [],

  css: ['./src/runtime/assets/css/main.css'],

  // Auto-import components with Orio prefix
  components: {
    dirs: [
      {
        path: './src/runtime/components',
        prefix: 'Orio',
        pathPrefix: false,
      },
    ],
  },

  // Auto-import composables
  imports: {
    dirs: ['./src/runtime/composables'],
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
  },

  compatibilityDate: '2025-01-15',
});
