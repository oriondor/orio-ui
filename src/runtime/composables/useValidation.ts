import { reactive, type MaybeRef, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import en from "../i18n/en.json";

export interface ValidationRule {
  model: MaybeRef<any>;
  id: string;
  validator: (model: any) => boolean;
  message?: string;
}

export function isFilled(value: string | []): boolean {
  return !!value.length;
}

export function isEmail(value: string): boolean {
  if (!value) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function getT(): (key: string) => string {
  try {
    return useI18n().t;
  } catch {
    return (key: string) =>
      key.split(".").reduce((o: any, k) => o?.[k], en) ?? key;
  }
}

export function useValidation(rules?: ValidationRule[]) {
  const t = getT();
  const validationRules = ref<ValidationRule[]>(rules ?? []);

  const errors = reactive<Record<string, string | null>>({});

  function validate({
    model,
    id,
    validator,
    message,
  }: ValidationRule): boolean {
    if (!validator(unref(model))) {
      if (!errors[id]) {
        errors[id] = message || t("validation.fieldError");
      }
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return false;
    }
    return true;
  }

  function checkValidity(): boolean {
    clearAllErrors();
    return validationRules.value.reduceRight(
      (valid, rule) => validate(rule) && valid,
      true,
    );
  }

  function clearError(id: string) {
    errors[id] = null;
  }

  function clearAllErrors() {
    Object.keys(errors).forEach((key) => (errors[key] = null));
  }

  function changeRules(rules: ValidationRule[]) {
    validationRules.value = rules;
  }

  return { checkValidity, errors, clearError, clearAllErrors, changeRules };
}
