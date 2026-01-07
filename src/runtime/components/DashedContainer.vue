<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon?: string;
  text?: string;
  size?: 'small' | 'medium' | 'large';
}
const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
});
defineEmits(['click']);

const iconSize = computed(() => {
  switch (props.size) {
    case 'small':
      return '2rem';
    case 'large':
      return '5rem';
    default:
      return '3rem';
  }
});
</script>
<template>
  <div class="dashed-container gradient-hover" @click="$emit('click')">
    <orio-icon
      v-if="icon"
      :name="icon"
      class="icon-class"
      :size="iconSize"
    />
    <span v-if="text" class="text-class" :size>{{ text }}</span>
  </div>
</template>

<style scoped lang="scss">
.dashed-container {
  cursor: pointer;
  border: 3px dashed var(--color-border);
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    .text-class {
      color: var(--color-accent-hover);
    }
  }
}
.icon-class {
  color: var(--color-muted);
}
.text-class {
  color: var(--color-accent);
}
</style>
