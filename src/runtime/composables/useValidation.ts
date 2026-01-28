import { reactive, isRef, type MaybeRef, ref } from "vue";

export interface ValidationRule {
  model: MaybeRef<any>;
  id: string;
  validator: (model: MaybeRef<any>) => boolean;
  message?: string;
}

export function isFilled(model: MaybeRef<string | []>): boolean {
  return isRef(model) ? !!model.value.length : !!model.length;
}

export function isEmail(model: MaybeRef<string>): boolean {
  const value = isRef(model) ? model.value : model;
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
    if (!validator(model)) {
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
