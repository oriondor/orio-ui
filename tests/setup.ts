import { config } from "@vue/test-utils";
import Button from "../src/runtime/components/Button.vue";
import NumberInput from "../src/runtime/components/NumberInput/index.vue";
import ControlElement from "../src/runtime/components/ControlElement.vue";
import Icon from "../src/runtime/components/Icon.vue";
import LoadingSpinner from "../src/runtime/components/LoadingSpinner.vue";

// Register components globally for all tests
config.global.components = {
  "orio-button": Button,
  "orio-number-input": NumberInput,
  "orio-control-element": ControlElement,
  "orio-icon": Icon,
  "orio-loading-spinner": LoadingSpinner,
};
