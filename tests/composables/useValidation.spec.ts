import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { i18n } from "../../src/runtime/i18n";
import {
  useValidation,
  isFilled,
  isEmail,
  type ValidationRule,
} from "../../src/runtime/composables/useValidation";

describe("useValidation", () => {
  describe("isFilled", () => {
    it("returns true for non-empty string", () => {
      expect(isFilled("hello")).toBe(true);
    });

    it("returns false for empty string", () => {
      expect(isFilled("")).toBe(false);
    });
  });

  describe("isEmail", () => {
    it("returns true for valid email", () => {
      expect(isEmail("test@example.com")).toBe(true);
    });

    it("returns false for invalid email", () => {
      expect(isEmail("not-an-email")).toBe(false);
    });

    it("returns true for empty string", () => {
      expect(isEmail("")).toBe(true);
    });
  });

  describe("with i18n plugin", () => {
    it("uses translated error message", () => {
      const result = ref<ReturnType<typeof useValidation> | null>(null);

      const Wrapper = defineComponent({
        setup() {
          const model = ref("");
          const rules: ValidationRule[] = [
            { model, id: "test-field", validator: isFilled },
          ];
          result.value = useValidation(rules);
          return () => null;
        },
      });

      mount(Wrapper, { global: { plugins: [i18n] } });

      result.value!.checkValidity();
      expect(result.value!.errors["test-field"]).toBe("Error on this field");
    });
  });

  describe("without i18n plugin (fallback)", () => {
    it("falls back to English defaults", () => {
      const result = ref<ReturnType<typeof useValidation> | null>(null);

      const Wrapper = defineComponent({
        setup() {
          const model = ref("");
          const rules: ValidationRule[] = [
            { model, id: "test-field", validator: isFilled },
          ];
          result.value = useValidation(rules);
          return () => null;
        },
      });

      mount(Wrapper);

      result.value!.checkValidity();
      expect(result.value!.errors["test-field"]).toBe("Error on this field");
    });
  });

  describe("clearError", () => {
    it("clears a specific error", () => {
      const result = ref<ReturnType<typeof useValidation> | null>(null);

      const Wrapper = defineComponent({
        setup() {
          const model = ref("");
          const rules: ValidationRule[] = [
            { model, id: "field-1", validator: isFilled },
          ];
          result.value = useValidation(rules);
          return () => null;
        },
      });

      mount(Wrapper);

      result.value!.checkValidity();
      expect(result.value!.errors["field-1"]).toBeTruthy();

      result.value!.clearError("field-1");
      expect(result.value!.errors["field-1"]).toBeNull();
    });
  });

  describe("custom message", () => {
    it("uses custom message over i18n", () => {
      const result = ref<ReturnType<typeof useValidation> | null>(null);

      const Wrapper = defineComponent({
        setup() {
          const model = ref("");
          const rules: ValidationRule[] = [
            {
              model,
              id: "test-field",
              validator: isFilled,
              message: "Custom error",
            },
          ];
          result.value = useValidation(rules);
          return () => null;
        },
      });

      mount(Wrapper);

      result.value!.checkValidity();
      expect(result.value!.errors["test-field"]).toBe("Custom error");
    });
  });
});
