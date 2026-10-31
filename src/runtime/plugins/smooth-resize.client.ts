import { defineNuxtPlugin } from "#app";
import { startSmoothResize } from "../utils/smooth-resize";

export default defineNuxtPlugin({
  name: "orio-ui-smooth-resize",
  setup() {
    startSmoothResize();
  },
});
