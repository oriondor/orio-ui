<script setup lang="ts">
interface Props {
  direction?: "column" | "row";
}

withDefaults(defineProps<Props>(), {
  direction: "row",
});
</script>

<template>
  <div class="animated-container" :class="[direction]">
    <slot />
  </div>
</template>

<style>
.animated-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding-inline: 1rem;
}

.animated-container.column {
  flex-direction: column;
  justify-content: flex-start;
}

.animated-container > * {
  animation: containerFadeInUp 0.5s ease-out both;
}

@keyframes containerFadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
