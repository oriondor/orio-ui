import { reactive, type MaybeRef, ref, unref } from "vue";

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

export function useValidation(rules?: ValidationRule[]) {
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
        errors[id] = message || "Error on this field";
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
