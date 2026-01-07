<template>
  <div>
    <div ref="trigger" @click="togglePopover()">
      <slot :toggle="togglePopover" />
    </div>

    <Teleport to="body">
      <Transition name="animate-fade-slide" appear>
        <div
          v-if="showPopover"
          ref="popover"
          class="popover"
          :style="popoverStyle"
        >
          <slot name="content" :toggle="togglePopover" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useElementBounding } from '@vueuse/core';

const props = defineProps({
  /**
   * Defines where the popover is placed relative to the trigger.
   * Acceptable single values: 'top', 'bottom', 'left', 'right'
   * Acceptable combos: 'top-left', 'top-right', 'bottom-left', 'bottom-right',
   *                    'left-top', 'left-bottom', 'right-top', 'right-bottom'
   * If you only provide 'top', 'bottom', 'left', or 'right',
   * it aligns center by default.
   */
  position: {
    type: String,
    default: 'bottom-left',
  },
  /**
   * Distance (in px) between the popover and the trigger element.
   */
  offset: {
    type: Number,
    default: 10,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const trigger = ref(null);
const popover = ref(null);

const { width: popoverWidth, height: popoverHeight } =
  useElementBounding(popover);

const showPopover = ref(false);
const triggerRect = ref(null);
const popoverRect = ref(null);

/**
 * Calculates the inline style for the popover based on position & offset.
 */
const popoverStyle = computed(() => {
  if (!showPopover.value || !triggerRect.value || !popoverRect.value) {
    return;
  }

  const [main, sub = 'center'] = currentPosition.value.split('-');
  const offset = props.offset;

  const tRect = triggerRect.value;
  const pRect = popoverRect.value;

  let topValue = 0;
  let leftValue = 0;

  // Calculate vertical position (top)
  if (main === 'top') {
    topValue = tRect.top - offset - pRect.height;
  } else if (main === 'bottom') {
    topValue = tRect.bottom + offset;
  } else {
    // For 'left' or 'right' main, center vertically
    topValue = tRect.top + tRect.height / 2 - pRect.height / 2;
  }

  // Calculate horizontal position (left)
  if (sub === 'left') {
    leftValue = tRect.right - pRect.width;
  } else if (sub === 'right') {
    leftValue = tRect.left;
  } else {
    // 'center' is default horizontally
    leftValue = tRect.left + tRect.width / 2 - pRect.width / 2;
  }

  // If the main position is 'left' or 'right', override horizontal positioning
  if (main === 'left') {
    leftValue = tRect.left - offset - pRect.width;
  } else if (main === 'right') {
    leftValue = tRect.right + offset;
  }

  return {
    top: `${topValue}px`,
    left: `${leftValue}px`,
  };
});

const currentPosition = ref(props.position);

const getFallbackPositions = (pos: string) => {
  const [main, sub = 'center'] = pos.split('-');

  const opposites: Record<string, string> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };

  const allPositions = [
    `${main}-${sub}`,
    `${opposites[main]}-${sub}`,
    `${main}-center`,
    `${opposites[main]}-center`,
    `${sub}-${main}`, // e.g. left-top
    `${sub}-${opposites[main]}`,
  ];

  return [...new Set(allPositions)];
};

function checkIfFits(position: string, tRect: any, pRect: any, offset: number) {
  const [main, sub = 'center'] = position.split('-');

  const space = {
    top: tRect.top,
    bottom: window.innerHeight - tRect.bottom,
    left: tRect.left,
    right: window.innerWidth - tRect.right,
  };

  if (main === 'top' && space.top < pRect.height + offset) return false;
  if (main === 'bottom' && space.bottom < pRect.height + offset) return false;
  if (main === 'left' && space.left < pRect.width + offset) return false;
  if (main === 'right' && space.right < pRect.width + offset) return false;

  return true;
}

/**
 * Calculates bounding client rects for trigger & popover,
 * updating reactive refs.
 */
async function updateRects() {
  await nextTick();
  const triggerEl = trigger.value;
  const popoverEl = popover.value?.firstElementChild || popover.value;

  if (!triggerEl || !popoverEl) return;

  const tRect = triggerEl.getBoundingClientRect();
  triggerRect.value = tRect;

  const fallbacks = getFallbackPositions(props.position);

  for (const pos of fallbacks) {
    // temporarily apply style to measure it
    popoverEl.style.visibility = 'hidden';
    popoverEl.style.display = 'block';

    const pRect = popoverEl.getBoundingClientRect();
    const fits = checkIfFits(pos, tRect, pRect, props.offset);

    if (fits) {
      popoverRect.value = pRect;
      currentPosition.value = pos;
      popoverEl.style.visibility = '';
      return;
    }
  }

  // fallback to original
  popoverRect.value = popoverEl.getBoundingClientRect();
  currentPosition.value = props.position;
}

/**
 * Toggles popover visibility.
 * @param {boolean|null} force - If `true`/`false`, force that state; if `null`, toggle.
 */
async function togglePopover(force: boolean | null = null) {
  if (props.disabled) return;
  showPopover.value = force !== null ? force : !showPopover.value;
  if (!showPopover.value) return;

  await nextTick();
  updateRects();
}

/**
 * Closes the popover if the click is outside trigger/popover.
 */
function handleDocumentClick(e: MouseEvent) {
  if (!showPopover.value) return;

  const clickedInsideTrigger =
    trigger.value && trigger.value.contains(e.target as Node);
  const clickedInsidePopover =
    popover.value && popover.value.contains(e.target as Node);

  if (!clickedInsideTrigger && !clickedInsidePopover) {
    showPopover.value = false;
  }
}

/**
 * Updates position of popover on scroll/resize if popover is open.
 */
function redrawPopover() {
  if (!showPopover.value) return;
  updateRects();
}

watch([popoverWidth, popoverHeight], redrawPopover);

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  window.addEventListener('scroll', redrawPopover, true);
  window.addEventListener('resize', redrawPopover, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
  window.removeEventListener('scroll', redrawPopover, true);
  window.removeEventListener('resize', redrawPopover, true);
});
</script>
<style lang="scss" scoped>
.popover {
  border: 0;
  background-color: transparent;
  position: fixed;
  z-index: 1;
}
</style>
