<script setup lang="ts" generic="T extends object">
import { useSlots, cloneVNode, type VNode } from "vue";

export interface FormProps {
  /**
   * Disables all form controls and the submit button
   */
  disabled?: boolean;
  /**
   * Shows a loading state (e.g. during async submission)
   */
  loading?: boolean;
}

const { disabled = false, loading = false } = defineProps<FormProps>();

const modelValue = defineModel<T>();

const emit = defineEmits<{
  submit: [];
}>();

const slots = useSlots();

function getByPath(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function setByPath(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const parent = keys.reduce((current, key) => current?.[key], obj);
  if (parent) parent[lastKey] = value;
}

function wrapSlotFn(fn: (...args: any[]) => VNode[]) {
  return (...args: any[]) => bindFields(fn(...args));
}

function processChildren(children: unknown): unknown {
  if (Array.isArray(children)) {
    return bindFields(children as VNode[]);
  }
  if (typeof children === "function") {
    return wrapSlotFn(children as (...args: any[]) => VNode[]);
  }
  if (children && typeof children === "object") {
    const slotObj = children as Record<string, (...args: any[]) => VNode[]>;
    return Object.fromEntries(
      Object.entries(slotObj).map(([key, fn]) => [key, wrapSlotFn(fn)]),
    );
  }
  return children;
}

function bindFields(vnodes: VNode[]): VNode[] {
  return vnodes.map((vnode) => {
    const name = vnode.props?.name as string | undefined;
    if (
      name &&
      modelValue.value &&
      getByPath(modelValue.value, name) !== undefined
    ) {
      return cloneVNode(vnode, {
        modelValue: getByPath(modelValue.value, name),
        "onUpdate:modelValue": (newValue: any) => {
          setByPath(modelValue.value as Record<string, any>, name, newValue);
        },
      });
    }
    if (vnode.children) {
      const clone = cloneVNode(vnode);
      clone.children = processChildren(vnode.children) as VNode[];
      return clone;
    }
    return vnode;
  });
}

function renderSlot() {
  const children = slots.default?.();
  if (!children || !modelValue.value) return children;
  return bindFields(children);
}

const slotRenderer = () => renderSlot();

function onSubmit(e: Event) {
  e.preventDefault();
  if (disabled || loading) return;
  emit("submit");
}
</script>

<template>
  <form
    :class="{ disabled, loading }"
    :aria-disabled="disabled || undefined"
    :aria-busy="loading || undefined"
    novalidate
    @submit="onSubmit"
  >
    <fieldset v-if="disabled" disabled>
      <component :is="slotRenderer" />
    </fieldset>
    <component :is="slotRenderer" v-else />
  </form>
</template>

<style lang="scss" scoped>
form {
  display: flex;
  flex-direction: column;
  width: 100%;

  &.disabled {
    opacity: 0.6;
  }

  &.loading {
    pointer-events: none;
  }

  fieldset {
    display: contents;
    border: none;
    padding: 0;
    margin: 0;
  }
}
</style>
