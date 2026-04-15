<script setup lang="ts">
import { computed } from "vue";

export interface KeyBindsProps {
  /** Backtick-delimited shortcut string, e.g. "`Ctrl` + `Z`" */
  bind: string;
}

const props = defineProps<KeyBindsProps>();

interface Segment {
  type: "key" | "text";
  value: string;
}

const segments = computed<Segment[]>(() => {
  const parts: Segment[] = [];
  const re = /`([^`]+)`/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(props.bind)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: props.bind.slice(last, match.index) });
    }
    parts.push({ type: "key", value: match[1] });
    last = match.index + match[0].length;
  }
  if (last < props.bind.length) {
    parts.push({ type: "text", value: props.bind.slice(last) });
  }
  return parts;
});
</script>

<template>
  <span class="keybinds">
    <template v-for="(seg, i) in segments" :key="i">
      <kbd v-if="seg.type === 'key'">{{ seg.value }}</kbd>
      <span v-else class="separator">{{ seg.value }}</span>
    </template>
  </span>
</template>

<style scoped>
.keybinds {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: var(--font-sm);
}

kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem 0.35rem;
  min-width: 1.25em;
  border-radius: var(--border-radius-sm, 4px);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
}

.separator {
  opacity: 0.6;
  font-size: 0.75rem;
}
</style>
