// Shim for Nuxt's `#imports` virtual module so VitePress (plain Vite, no Nuxt)
// can resolve composables that import from it (e.g. `useUrlSync`).
export { useRoute } from "vue-router";
