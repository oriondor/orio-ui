# LongPress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `<orio-long-press>` + `useLongPress`: wrap any element, scale it down while held, emit `trigger` after a delay or on a Safari force click.

**Architecture:** `useLongPress` composable owns all pointer / force / click-swallow logic via VueUse `useEventListener` and exposes `{ isPressing }`. `LongPress.vue` is a thin `inline-flex` wrapper that maps props → composable options, composable callbacks → emits, and renders scale feedback with CSS custom properties. Docs + agent docs follow the existing per-component layout.

**Tech Stack:** Vue 3.5 `<script setup lang="ts">`, `@vueuse/core` 11.3 (`useEventListener`), Vitest 4 + jsdom 25 + `@vue/test-utils`, VitePress docs.

**Spec:** `.superpowers/specs/2026-09-28-long-press-design.md`

## Global Constraints

- **No git.** User rule: never run `git add` / `commit` / `reset` unless explicitly asked. Tasks end with a test run, not a commit.
- **Node:** prefix every `npx` / `node` / `npm run` with `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"` (default node 16 x64 breaks esbuild).
- Nothing new under `docs/superpowers/` — specs/plans live in `.superpowers/`.
- Props pattern: `export interface LongPressProps { ... }` + `withDefaults(defineProps<LongPressProps>(), { ... })`.
- Defaults: `delay: 500`, `scale: 0.95`, `forceTouch: true`, `disabled: false`, `moveTolerance: 10`.
- `export type LongPressSource = "hold" | "force";` lives in `src/runtime/composables/useLongPress.ts`.
- Emits: `trigger(event: PointerEvent | MouseEvent, source: LongPressSource)`, `pressStart(event: PointerEvent)`, `pressCancel()`.
- All listeners via `useEventListener` from `@vueuse/core` — no raw `addEventListener`.
- No single-letter / abbreviated names (`event`, not `e`; `distance`, not `d`).
- Prefer `forEach` / `find` over C-style loops.
- Vue attribute shorthand: `:style`, not `:style="style"`.
- Templates use kebab-case tags: `<orio-long-press>`.
- Examples in docs/agent docs must be copied from the live docs demo, not invented.

## Review Focus

1. **Nested wrappers** — `<orio-long-press>` inside another: holding the inner one must trigger only the inner (pointerdown bubbles to both). Test in Task 1.
2. **Trigger then release** — releasing after a trigger must not emit `pressCancel` / call `onCancel`. Test in Task 1.
3. **Rapid re-press** — press, release at 300 ms, press again: trigger fires 500 ms after the *second* press, not 200 ms. Test in Task 1.
4. **Unmount mid-press** — component removed while held: no trigger fires afterwards. Test in Task 1.
5. **Prop change between presses** — `delay` changed from 500 to 1000 applies to the next press. Test in Task 2.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/runtime/composables/useLongPress.ts` | create | all press/force/click-swallow behavior |
| `tests/composables/useLongPress.spec.ts` | create | composable behavior tests |
| `src/runtime/components/LongPress.vue` | create | wrapper, prop→option mapping, emits, scale CSS |
| `tests/components/LongPress.spec.ts` | create | component tests |
| `src/runtime/index.ts` | modify | export component, composable, types |
| `docs/components/long-press.md` | create | public docs + live demos |
| `docs/composables/use-long-press.md` | create | public composable docs + live demo |
| `agents/components/LongPress.md` | create | agent invariants + quick ref |
| `agents/composables/useLongPress.md` | create | agent invariants + quick ref |
| `agents/composables/usePressAndHold.md` | modify | narrow `purpose` so routing doesn't send "long press" there |
| `CLAUDE.md`, `README.md`, `docs/index.md`, `.claude/agents/*` | regenerated | via `update-counts.mjs` + `generate-routing.mjs` |

Nuxt auto-registration (`addComponentsDir`, `addImportsDir`) and the VitePress theme glob + sidebar pick up new files automatically — no config edits.

---

### Task 1: `useLongPress` composable

**Files:**
- Create: `src/runtime/composables/useLongPress.ts`
- Test: `tests/composables/useLongPress.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  ```ts
  export type LongPressSource = "hold" | "force";
  export interface LongPressOptions {
    delay?: MaybeRefOrGetter<number>;          // default 500
    moveTolerance?: MaybeRefOrGetter<number>;  // default 10
    forceTouch?: MaybeRefOrGetter<boolean>;    // default true
    disabled?: MaybeRefOrGetter<boolean>;      // default false
    onStart?: (event: PointerEvent) => void;
    onCancel?: () => void;
    onTrigger: (event: PointerEvent | MouseEvent, source: LongPressSource) => void;
  }
  export function useLongPress(
    target: MaybeRefOrGetter<HTMLElement | null | undefined>,
    options: LongPressOptions,
  ): { isPressing: Readonly<Ref<boolean>> };
  ```

**jsdom note:** jsdom 25 has no `PointerEvent` constructor. Tests dispatch `MouseEvent` with pointer event type names and define `isPrimary` manually. The composable treats a missing `isPrimary` as primary (`event.isPrimary === false` → ignore).

- [ ] **Step 1: Write the failing tests**

Create `tests/composables/useLongPress.spec.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref, type Ref } from "vue";
import {
  useLongPress,
  type LongPressOptions,
} from "../../src/runtime/composables/useLongPress";

interface PointerInit {
  x?: number;
  y?: number;
  button?: number;
  isPrimary?: boolean;
}

function pointer(type: string, init: PointerInit = {}) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: init.x ?? 0,
    clientY: init.y ?? 0,
    button: init.button ?? 0,
  });
  Object.defineProperty(event, "isPrimary", { value: init.isPrimary ?? true });
  return event;
}

function forceEvent(type: string) {
  return new MouseEvent(type, { bubbles: true, cancelable: true });
}

function setup(options: Partial<LongPressOptions> = {}) {
  const onTrigger = vi.fn();
  const onStart = vi.fn();
  const onCancel = vi.fn();
  const childClick = vi.fn();
  let isPressing: Readonly<Ref<boolean>> = ref(false);

  const Harness = defineComponent({
    setup() {
      const element = ref<HTMLElement | null>(null);
      ({ isPressing } = useLongPress(element, {
        onTrigger,
        onStart,
        onCancel,
        ...options,
      }));
      return () =>
        h("div", { ref: element, class: "target" }, [
          h("button", { onClick: childClick }, "child"),
        ]);
    },
  });

  const wrapper = mount(Harness, { attachTo: document.body });
  const element = wrapper.find(".target").element as HTMLElement;
  const button = wrapper.find("button").element as HTMLButtonElement;

  return {
    wrapper,
    element,
    button,
    onTrigger,
    onStart,
    onCancel,
    childClick,
    isPressing: () => isPressing.value,
  };
}

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  describe("hold", () => {
    it("triggers once after the default 500ms delay", () => {
      const { element, onTrigger, onStart } = setup();
      const down = pointer("pointerdown");

      element.dispatchEvent(down);
      expect(onStart).toHaveBeenCalledWith(down);

      vi.advanceTimersByTime(499);
      expect(onTrigger).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onTrigger).toHaveBeenCalledTimes(1);
      expect(onTrigger).toHaveBeenCalledWith(down, "hold");
    });

    it("respects a custom delay", () => {
      const { element, onTrigger } = setup({ delay: 1000 });

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(999);
      expect(onTrigger).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onTrigger).toHaveBeenCalledTimes(1);
    });

    it("tracks isPressing from down until trigger", () => {
      const { element, isPressing } = setup();

      expect(isPressing()).toBe(false);
      element.dispatchEvent(pointer("pointerdown"));
      expect(isPressing()).toBe(true);

      vi.advanceTimersByTime(500);
      expect(isPressing()).toBe(false);
    });
  });

  describe("cancel", () => {
    it.each(["pointerup", "pointerleave", "pointercancel"])(
      "cancels on %s before the delay",
      (type) => {
        const { element, onTrigger, onCancel, isPressing } = setup();

        element.dispatchEvent(pointer("pointerdown"));
        vi.advanceTimersByTime(300);
        element.dispatchEvent(pointer(type));

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(isPressing()).toBe(false);

        vi.advanceTimersByTime(1000);
        expect(onTrigger).not.toHaveBeenCalled();
      },
    );

    it("cancels when the pointer moves past moveTolerance", () => {
      const { element, onTrigger, onCancel } = setup({ moveTolerance: 10 });

      element.dispatchEvent(pointer("pointerdown", { x: 0, y: 0 }));
      element.dispatchEvent(pointer("pointermove", { x: 6, y: 6 }));
      expect(onCancel).not.toHaveBeenCalled();

      element.dispatchEvent(pointer("pointermove", { x: 8, y: 8 }));
      expect(onCancel).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("does not call onCancel when released after a trigger", () => {
      const { element, onTrigger, onCancel } = setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      element.dispatchEvent(pointer("pointerup"));

      expect(onTrigger).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("restarts the timer on a rapid re-press", () => {
      const { element, onTrigger } = setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(300);
      element.dispatchEvent(pointer("pointerup"));
      element.dispatchEvent(pointer("pointerdown"));

      vi.advanceTimersByTime(499);
      expect(onTrigger).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onTrigger).toHaveBeenCalledTimes(1);
    });
  });

  describe("ignored input", () => {
    it("ignores non-left mouse buttons", () => {
      const { element, onTrigger, onStart } = setup();

      element.dispatchEvent(pointer("pointerdown", { button: 2 }));
      vi.advanceTimersByTime(1000);

      expect(onStart).not.toHaveBeenCalled();
      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("ignores non-primary pointers", () => {
      const { element, onTrigger } = setup();

      element.dispatchEvent(pointer("pointerdown", { isPrimary: false }));
      vi.advanceTimersByTime(1000);

      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("does nothing while disabled", () => {
      const { element, onTrigger, onStart } = setup({ disabled: true });

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(forceEvent("webkitmouseforcedown"));
      vi.advanceTimersByTime(1000);

      expect(onStart).not.toHaveBeenCalled();
      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("cancels when disabled mid-press", async () => {
      const disabled = ref(false);
      const { element, onTrigger, onCancel } = setup({ disabled });

      element.dispatchEvent(pointer("pointerdown"));
      disabled.value = true;
      await nextTick();

      expect(onCancel).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(1000);
      expect(onTrigger).not.toHaveBeenCalled();
    });
  });

  describe("Safari force click", () => {
    it("triggers immediately on webkitmouseforcedown", () => {
      const { element, onTrigger } = setup();
      const force = forceEvent("webkitmouseforcedown");

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(force);

      expect(onTrigger).toHaveBeenCalledTimes(1);
      expect(onTrigger).toHaveBeenCalledWith(force, "force");
    });

    it("does not fire the hold trigger after a force trigger", () => {
      const { element, onTrigger } = setup();

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(forceEvent("webkitmouseforcedown"));
      vi.advanceTimersByTime(1000);

      expect(onTrigger).toHaveBeenCalledTimes(1);
    });

    it("ignores force events without an active press", () => {
      const { element, onTrigger } = setup();

      element.dispatchEvent(forceEvent("webkitmouseforcedown"));

      expect(onTrigger).not.toHaveBeenCalled();
    });

    it("ignores force events when forceTouch is false", () => {
      const { element, onTrigger } = setup({ forceTouch: false });

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(forceEvent("webkitmouseforcedown"));
      expect(onTrigger).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(onTrigger).toHaveBeenCalledWith(expect.anything(), "hold");
    });

    it("prevents default on webkitmouseforcewillbegin to suppress Look Up", () => {
      const { element } = setup();
      const willBegin = forceEvent("webkitmouseforcewillbegin");

      element.dispatchEvent(willBegin);

      expect(willBegin.defaultPrevented).toBe(true);
    });

    it("leaves webkitmouseforcewillbegin alone when forceTouch is false", () => {
      const { element } = setup({ forceTouch: false });
      const willBegin = forceEvent("webkitmouseforcewillbegin");

      element.dispatchEvent(willBegin);

      expect(willBegin.defaultPrevented).toBe(false);
    });
  });

  describe("click swallow", () => {
    it("swallows the click that follows a trigger", () => {
      const { element, button, childClick } = setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      button.click();

      expect(childClick).not.toHaveBeenCalled();
    });

    it("lets a click through when no trigger happened", () => {
      const { element, button, childClick } = setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(200);
      element.dispatchEvent(pointer("pointerup"));
      button.click();

      expect(childClick).toHaveBeenCalledTimes(1);
    });

    it("swallows only one click", () => {
      const { element, button, childClick } = setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      button.click();
      button.click();

      expect(childClick).toHaveBeenCalledTimes(1);
    });

    it("disarms the swallow on the next pointerdown", () => {
      const { element, button, childClick } = setup();

      element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);
      // touch browsers may never send the click — next press starts clean
      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(pointer("pointerup"));
      button.click();

      expect(childClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("contextmenu", () => {
    it("prevents the context menu while pressing", () => {
      const { element } = setup();
      const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });

      element.dispatchEvent(pointer("pointerdown"));
      element.dispatchEvent(menu);

      expect(menu.defaultPrevented).toBe(true);
    });

    it("leaves the context menu alone when idle", () => {
      const { element } = setup();
      const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });

      element.dispatchEvent(menu);

      expect(menu.defaultPrevented).toBe(false);
    });
  });

  describe("nesting and lifecycle", () => {
    it("only the innermost wrapper handles a press", () => {
      const outerTrigger = vi.fn();
      const innerTrigger = vi.fn();

      const Nested = defineComponent({
        setup() {
          const outer = ref<HTMLElement | null>(null);
          const inner = ref<HTMLElement | null>(null);
          useLongPress(outer, { onTrigger: outerTrigger });
          useLongPress(inner, { onTrigger: innerTrigger });
          return () =>
            h("div", { ref: outer }, [h("div", { ref: inner, class: "inner" })]);
        },
      });

      const wrapper = mount(Nested, { attachTo: document.body });
      wrapper.find(".inner").element.dispatchEvent(pointer("pointerdown"));
      vi.advanceTimersByTime(500);

      expect(innerTrigger).toHaveBeenCalledTimes(1);
      expect(outerTrigger).not.toHaveBeenCalled();
    });

    it("does not trigger after unmount mid-press", () => {
      const { wrapper, element, onTrigger } = setup();

      element.dispatchEvent(pointer("pointerdown"));
      wrapper.unmount();
      vi.advanceTimersByTime(1000);

      expect(onTrigger).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/composables/useLongPress.spec.ts`
Expected: FAIL — cannot resolve `../../src/runtime/composables/useLongPress`.

- [ ] **Step 3: Implement the composable**

Create `src/runtime/composables/useLongPress.ts`:

```ts
import {
  onScopeDispose,
  readonly,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
import { useEventListener } from "@vueuse/core";

export type LongPressSource = "hold" | "force";

export interface LongPressOptions {
  delay?: MaybeRefOrGetter<number>;
  moveTolerance?: MaybeRefOrGetter<number>;
  forceTouch?: MaybeRefOrGetter<boolean>;
  disabled?: MaybeRefOrGetter<boolean>;
  onStart?: (event: PointerEvent) => void;
  onCancel?: () => void;
  onTrigger: (
    event: PointerEvent | MouseEvent,
    source: LongPressSource,
  ) => void;
}

// A pointerdown bubbles through every nested wrapper; the first (innermost)
// one to see it claims it so outer wrappers stay idle.
const claimedEvents = new WeakSet<Event>();

export function useLongPress(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: LongPressOptions,
) {
  const isPressing = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let startPosition: { x: number; y: number } | null = null;
  let swallowNextClick = false;

  const isDisabled = () => toValue(options.disabled) ?? false;
  const isForceTouchEnabled = () =>
    (toValue(options.forceTouch) ?? true) && !isDisabled();

  function clearTimer() {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
  }

  function reset() {
    clearTimer();
    startPosition = null;
    isPressing.value = false;
  }

  function cancel() {
    const wasPressing = isPressing.value;
    reset();
    if (wasPressing) options.onCancel?.();
  }

  function trigger(event: PointerEvent | MouseEvent, source: LongPressSource) {
    reset();
    swallowNextClick = true;
    options.onTrigger(event, source);
  }

  function handlePointerDown(event: PointerEvent) {
    swallowNextClick = false;
    if (claimedEvents.has(event)) return;
    if (isDisabled()) return;
    if (event.button !== 0 || event.isPrimary === false) return;

    claimedEvents.add(event);
    clearTimer();
    startPosition = { x: event.clientX, y: event.clientY };
    isPressing.value = true;
    options.onStart?.(event);
    timer = setTimeout(
      () => trigger(event, "hold"),
      toValue(options.delay) ?? 500,
    );
  }

  function handlePointerMove(event: PointerEvent) {
    if (!startPosition) return;
    const distance = Math.hypot(
      event.clientX - startPosition.x,
      event.clientY - startPosition.y,
    );
    if (distance >= (toValue(options.moveTolerance) ?? 10)) cancel();
  }

  function handleForceWillBegin(event: MouseEvent) {
    if (isForceTouchEnabled()) event.preventDefault();
  }

  function handleForceDown(event: MouseEvent) {
    if (!isForceTouchEnabled() || !isPressing.value) return;
    trigger(event, "force");
  }

  function handleClick(event: MouseEvent) {
    if (!swallowNextClick) return;
    swallowNextClick = false;
    event.stopPropagation();
    event.preventDefault();
  }

  function handleContextMenu(event: MouseEvent) {
    if (isPressing.value || swallowNextClick) event.preventDefault();
  }

  useEventListener(target, "pointerdown", handlePointerDown);
  useEventListener(target, "pointermove", handlePointerMove);
  useEventListener(
    target,
    ["pointerup", "pointerleave", "pointercancel"],
    cancel,
  );
  // Safari-only (Force Touch trackpad); never dispatched elsewhere.
  useEventListener<MouseEvent>(
    target,
    "webkitmouseforcewillbegin",
    handleForceWillBegin,
  );
  useEventListener<MouseEvent>(target, "webkitmouseforcedown", handleForceDown);
  useEventListener(target, "click", handleClick, { capture: true });
  useEventListener(target, "contextmenu", handleContextMenu);

  watch(isDisabled, (disabled) => {
    if (disabled) cancel();
  });

  onScopeDispose(clearTimer);

  return { isPressing: readonly(isPressing) };
}
```

Note: `cancel` is registered for `pointerup` too, but after a trigger `isPressing` is already `false`, so `onCancel` is not called — this is the "trigger then release" rule.

If `useEventListener<MouseEvent>(target, "webkit…", …)` fails typecheck against the `HTMLElement` overload, cast the target once: `const eventTarget = target as MaybeRefOrGetter<EventTarget | null | undefined>;` and use it for the two webkit listeners.

- [ ] **Step 4: Run tests to verify they pass**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/composables/useLongPress.spec.ts`
Expected: all PASS.

- [ ] **Step 5: Typecheck**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npm run typecheck`
Expected: no errors in `useLongPress.ts` or its spec (pre-existing errors elsewhere: note them, don't fix).

---

### Task 2: `LongPress.vue` component + exports

**Files:**
- Create: `src/runtime/components/LongPress.vue`
- Modify: `src/runtime/index.ts` (after the `Badge` export, line ~40; and after the `usePressAndHold` export, line ~93)
- Test: `tests/components/LongPress.spec.ts`

**Interfaces:**
- Consumes: `useLongPress`, `LongPressSource` from Task 1.
- Produces:
  - `export interface LongPressProps { delay?: number; scale?: number; forceTouch?: boolean; disabled?: boolean; moveTolerance?: number }`
  - emits `trigger`, `pressStart`, `pressCancel` (template: `@trigger`, `@press-start`, `@press-cancel`)
  - root `div.long-press`, class `pressing` while held, class `disabled` when disabled
  - inline CSS vars `--long-press-scale`, `--long-press-duration`

- [ ] **Step 1: Write the failing tests**

Create `tests/components/LongPress.spec.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import LongPress from "../../src/runtime/components/LongPress.vue";

function pointer(type: string) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 });
  Object.defineProperty(event, "isPrimary", { value: true });
  return event;
}

describe("LongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("renders the default slot inside the wrapper", () => {
    const wrapper = mount(LongPress, {
      slots: { default: "<span class='child'>Hold me</span>" },
    });

    expect(wrapper.classes()).toContain("long-press");
    expect(wrapper.find(".child").text()).toBe("Hold me");
  });

  it("exposes scale and delay as CSS custom properties", () => {
    const wrapper = mount(LongPress, { props: { scale: 0.9, delay: 800 } });
    const style = (wrapper.element as HTMLElement).style;

    expect(style.getPropertyValue("--long-press-scale")).toBe("0.9");
    expect(style.getPropertyValue("--long-press-duration")).toBe("800ms");
  });

  it("toggles the pressing class while held", async () => {
    const wrapper = mount(LongPress, { attachTo: document.body });

    wrapper.element.dispatchEvent(pointer("pointerdown"));
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain("pressing");

    wrapper.element.dispatchEvent(pointer("pointerup"));
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).not.toContain("pressing");
  });

  it("adds the disabled class", () => {
    const wrapper = mount(LongPress, { props: { disabled: true } });

    expect(wrapper.classes()).toContain("disabled");
  });

  it("emits pressStart and trigger with the event and source", () => {
    const wrapper = mount(LongPress, { attachTo: document.body });
    const down = pointer("pointerdown");

    wrapper.element.dispatchEvent(down);
    vi.advanceTimersByTime(500);

    expect(wrapper.emitted("pressStart")).toEqual([[down]]);
    expect(wrapper.emitted("trigger")).toEqual([[down, "hold"]]);
  });

  it("emits pressCancel on early release", () => {
    const wrapper = mount(LongPress, { attachTo: document.body });

    wrapper.element.dispatchEvent(pointer("pointerdown"));
    vi.advanceTimersByTime(200);
    wrapper.element.dispatchEvent(pointer("pointerup"));

    expect(wrapper.emitted("pressCancel")).toHaveLength(1);
    expect(wrapper.emitted("trigger")).toBeUndefined();
  });

  it("applies a changed delay on the next press", async () => {
    const wrapper = mount(LongPress, { attachTo: document.body });

    await wrapper.setProps({ delay: 1000 });
    wrapper.element.dispatchEvent(pointer("pointerdown"));
    vi.advanceTimersByTime(999);
    expect(wrapper.emitted("trigger")).toBeUndefined();

    vi.advanceTimersByTime(1);
    expect(wrapper.emitted("trigger")).toHaveLength(1);
  });

  it("does not activate the wrapped button after a trigger", () => {
    const childClick = vi.fn();
    const wrapper = mount(LongPress, {
      attachTo: document.body,
      slots: { default: () => h("button", { onClick: childClick }, "child") },
    });

    wrapper.element.dispatchEvent(pointer("pointerdown"));
    vi.advanceTimersByTime(500);
    (wrapper.find("button").element as HTMLButtonElement).click();

    expect(childClick).not.toHaveBeenCalled();
  });

  it("passes a normal click through to the wrapped button", () => {
    const childClick = vi.fn();
    const wrapper = mount(LongPress, {
      attachTo: document.body,
      slots: { default: () => h("button", { onClick: childClick }, "child") },
    });

    (wrapper.find("button").element as HTMLButtonElement).click();

    expect(childClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/components/LongPress.spec.ts`
Expected: FAIL — cannot resolve `LongPress.vue`.

- [ ] **Step 3: Implement the component**

Create `src/runtime/components/LongPress.vue`:

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  useLongPress,
  type LongPressSource,
} from "../composables/useLongPress";

export interface LongPressProps {
  delay?: number;
  scale?: number;
  forceTouch?: boolean;
  disabled?: boolean;
  moveTolerance?: number;
}

const props = withDefaults(defineProps<LongPressProps>(), {
  delay: 500,
  scale: 0.95,
  forceTouch: true,
  disabled: false,
  moveTolerance: 10,
});

const emit = defineEmits<{
  trigger: [event: PointerEvent | MouseEvent, source: LongPressSource];
  pressStart: [event: PointerEvent];
  pressCancel: [];
}>();

const root = ref<HTMLElement | null>(null);

const { isPressing } = useLongPress(root, {
  delay: () => props.delay,
  moveTolerance: () => props.moveTolerance,
  forceTouch: () => props.forceTouch,
  disabled: () => props.disabled,
  onStart: (event) => emit("pressStart", event),
  onCancel: () => emit("pressCancel"),
  onTrigger: (event, source) => emit("trigger", event, source),
});

const style = computed(() => ({
  "--long-press-scale": props.scale,
  "--long-press-duration": `${props.delay}ms`,
}));
</script>

<template>
  <div
    ref="root"
    class="long-press"
    :class="{ pressing: isPressing, disabled }"
    :style
  >
    <slot />
  </div>
</template>

<style scoped>
.long-press {
  display: inline-flex;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
  transform: scale(1);
  transition: transform 150ms ease-out;
}

.long-press.pressing {
  transform: scale(var(--long-press-scale));
  transition-duration: var(--long-press-duration);
  transition-timing-function: ease-in;
}

@media (prefers-reduced-motion: reduce) {
  .long-press,
  .long-press.pressing {
    transform: none;
    transition: none;
  }
}
</style>
```

- [ ] **Step 4: Add exports**

In `src/runtime/index.ts`, after `export { default as Badge } from "./components/Badge.vue";`:

```ts
export {
  default as LongPress,
  type LongPressProps,
} from "./components/LongPress.vue";
```

After `export { usePressAndHold } from "./composables/usePressAndHold";`:

```ts
export {
  useLongPress,
  type LongPressOptions,
  type LongPressSource,
} from "./composables/useLongPress";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/components/LongPress.spec.ts tests/composables/useLongPress.spec.ts`
Expected: all PASS.

- [ ] **Step 6: Full suite + typecheck + lint**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run && PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npm run typecheck && PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npm run lint`
Expected: all suites PASS; no new typecheck/lint errors from the new files.

---

### Task 3: Docs, agent docs, routing

**Files:**
- Create: `docs/components/long-press.md`
- Create: `docs/composables/use-long-press.md`
- Create: `agents/components/LongPress.md`
- Create: `agents/composables/useLongPress.md`
- Modify: `agents/composables/usePressAndHold.md:4` (`purpose` line)
- Regenerated: `CLAUDE.md`, `README.md`, `docs/index.md`, `.claude/agents/component-*.md`

**Interfaces:**
- Consumes: `<orio-long-press>` (Task 2), `useLongPress` (Task 1), `useModal` (`{ modalProps, openModal }`), `<orio-modal>`, `<orio-button>`, `<orio-view-text>` (`type`: `"text" | "title" | "subtitle" | "italics"`).
- Produces: public docs pages; routing entries for both.

- [ ] **Step 1: Write the component docs page**

Create `docs/components/long-press.md`:

````md
# LongPress

Wraps any element and emits `trigger` after a press-and-hold — the web take on
Haptic Touch. The wrapped element slowly scales down while held so the user
sees something is happening. On macOS Safari with a Force Touch trackpad, a
firm click triggers immediately.

## Live Demo

<script setup>
import { ref } from 'vue'
import { useModal } from '../../src/runtime/composables/useModal'

const { modalProps, openModal } = useModal()
const lastSource = ref('none')
</script>

### Open a modal on hold

<div class="demo-container">
  <div class="demo-row">
    <orio-long-press @trigger="openModal">
      <orio-button>Hold me</orio-button>
    </orio-long-press>
  </div>

  <orio-modal v-bind="modalProps">
    <orio-view-text type="title">Hidden feature</orio-view-text>
    <orio-view-text>Opened by a long press.</orio-view-text>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</div>

### Hold vs force click

<div class="demo-container">
  <div class="demo-row">
    <orio-long-press
      :delay="800"
      :scale="0.9"
      @trigger="(event, source) => (lastSource = source)"
    >
      <orio-button variant="secondary">Hold or force-click</orio-button>
    </orio-long-press>
    <orio-view-text>Last trigger: {{ lastSource }}</orio-view-text>
  </div>
</div>

## Usage

```vue
<template>
  <orio-long-press @trigger="openModal">
    <orio-button>Hold me</orio-button>
  </orio-long-press>

  <orio-modal v-bind="modalProps">
    <orio-view-text type="title">Hidden feature</orio-view-text>
    <orio-view-text>Opened by a long press.</orio-view-text>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `delay` | `number` | `500` | Hold time in ms before `trigger` |
| `scale` | `number` | `0.95` | Scale reached at the moment of trigger |
| `forceTouch` | `boolean` | `true` | Safari force click triggers immediately and suppresses Look Up |
| `disabled` | `boolean` | `false` | No feedback, no events; normal clicks still work |
| `moveTolerance` | `number` | `10` | Pointer movement in px that cancels the press |

## Events

| Event | Payload | Description |
|---|---|---|
| `trigger` | `(event: PointerEvent \| MouseEvent, source: "hold" \| "force")` | Hold reached `delay`, or force click |
| `press-start` | `(event: PointerEvent)` | Primary pointer went down |
| `press-cancel` | — | Press ended without triggering |

`trigger` passes the original event, so `@trigger="openModal"` animates the
modal from the pressed element.

## Behavior

- The click that follows a trigger is swallowed — the wrapped button does not
  also activate. A short press is a normal click.
- Only the left button / primary pointer counts.
- Moving past `moveTolerance`, leaving the element, or a touch scroll cancels.
- The native context menu is blocked while held.
- With `prefers-reduced-motion: reduce` the scale is skipped; `trigger` still fires.

## Browser support

Long press works everywhere. Force click uses Safari's proprietary
`webkitmouseforce*` events — Chrome, Firefox and iOS do not expose trackpad or
screen pressure, so there it is a normal long press.

## Accessibility

There is no keyboard equivalent of a long press. Make sure the action behind
`trigger` is also reachable another way (a menu button, a shortcut).
````

- [ ] **Step 2: Write the composable docs page**

Create `docs/composables/use-long-press.md`:

````md
# useLongPress

Long-press detection for any element. Powers `<orio-long-press>`; use it
directly when you need the behavior without the wrapper's scale feedback.

## Live Demo

<script setup>
import { ref } from 'vue'
import { useLongPress } from '../../src/runtime/composables/useLongPress'

const target = ref(null)
const log = ref([])

const { isPressing } = useLongPress(target, {
  delay: 600,
  onStart: () => log.value.unshift('start'),
  onCancel: () => log.value.unshift('cancel'),
  onTrigger: (event, source) => log.value.unshift(`trigger (${source})`),
})
</script>

<div class="demo-container">
  <div
    ref="target"
    :style="{
      padding: '2rem',
      border: '1px dashed var(--color-border)',
      borderRadius: 'var(--border-radius-md)',
      userSelect: 'none',
      background: isPressing ? 'var(--color-surface)' : 'transparent',
    }"
  >
    <orio-view-text>Hold here</orio-view-text>
  </div>
  <orio-view-text>{{ log.slice(0, 5).join(' ← ') }}</orio-view-text>
</div>

## Usage

```ts
const target = ref<HTMLElement | null>(null);

const { isPressing } = useLongPress(target, {
  delay: 600,
  onStart: () => log.value.unshift("start"),
  onCancel: () => log.value.unshift("cancel"),
  onTrigger: (event, source) => log.value.unshift(`trigger (${source})`),
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `delay` | `MaybeRefOrGetter<number>` | `500` | Hold time in ms |
| `moveTolerance` | `MaybeRefOrGetter<number>` | `10` | Movement in px that cancels |
| `forceTouch` | `MaybeRefOrGetter<boolean>` | `true` | Safari force click triggers immediately |
| `disabled` | `MaybeRefOrGetter<boolean>` | `false` | Ignore presses; cancels an active one |
| `onStart` | `(event: PointerEvent) => void` | — | Primary pointer went down |
| `onCancel` | `() => void` | — | Press ended without triggering |
| `onTrigger` | `(event, source: "hold" \| "force") => void` | required | Hold reached `delay`, or force click |

## Returns

| Key | Type | Description |
|---|---|---|
| `isPressing` | `Readonly<Ref<boolean>>` | `true` from pointerdown until trigger or cancel |

## Notes

- The click after a trigger is swallowed (capture phase on the target).
- Nested targets: only the innermost handles a press.
- Not to be confused with `usePressAndHold`, which repeats a callback while held.
````

- [ ] **Step 3: Verify both demos in the docs site**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npm run docs:dev`
Open `/components/long-press` and `/composables/use-long-press`. Check:
- holding "Hold me" scales it down, opens the modal from the button after 500 ms, and the button's click does not fire;
- a quick click does nothing visible (no modal);
- second demo shows `Last trigger: hold` (and `force` in Safari with a firm click);
- composable demo log shows `start`, `cancel` / `trigger (hold)`.
Then run `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npm run docs:build` — Expected: build succeeds (SSR-safe).

If a demo needs a change to work, update the page and copy the change into the "Usage" block — they must stay identical.

- [ ] **Step 4: Write the component agent doc**

Create `agents/components/LongPress.md` (quick reference copied from the docs demo, Step 1):

````md
---
kind: component
category: Buttons & indicators
purpose: long press, press and hold to open, haptic touch, 3d touch, force click, hold for context menu, hidden action on hold
short: wrapper that scales its child down while held and emits `trigger` after a delay or on Safari force click
invariants: true
---

# LongPress — agent-only invariants

`<orio-long-press>` wraps any element (default slot only — no `#wrapping`)
and emits `trigger(event, source)` after a hold. Behavior lives in
`useLongPress`; the component adds scale feedback.

## Invariants

- **Click after a trigger is swallowed.** A capture-phase listener on the
  wrapper stops the next `click`, so a wrapped `<orio-button @click>` does
  not also fire. A short press is a normal click.
- **`trigger` passes the original event.** `@trigger="openModal"` works with
  `useModal` — origin comes from `event.target`.
- **`source` is `"hold"` or `"force"`.** `"force"` only in macOS Safari with a
  Force Touch trackpad (`webkitmouseforce*` events). Everywhere else it is
  always `"hold"`.
- **Primary pointer + left button only.** Right-click-hold does nothing.
- **Cancels** on pointerup/leave/cancel or movement ≥ `moveTolerance` before
  the delay. Releasing *after* a trigger does not emit `press-cancel`.
- **Nested wrappers:** only the innermost reacts to a press.
- **Wrapper is `display: inline-flex`** with `user-select: none`,
  `-webkit-touch-callout: none`, `touch-action: manipulation`.
- **Reduced motion:** scale disabled, `trigger` still fires.

## Gotchas

- **No keyboard trigger.** Provide another path to the same action.
- **Block-level children** stay shrink-wrapped by `inline-flex`; set
  `style="display: flex"` on the wrapper if the child must stretch.
- **Don't wrap in another element that also handles long press**
  (e.g. a draggable) — both will compete for the pointer.

## Quick reference

```vue
<!-- from docs/components/long-press.md -->
<template>
  <orio-long-press @trigger="openModal">
    <orio-button>Hold me</orio-button>
  </orio-long-press>

  <orio-modal v-bind="modalProps">
    <orio-view-text type="title">Hidden feature</orio-view-text>
    <orio-view-text>Opened by a long press.</orio-view-text>
    <orio-button @click="modalProps.show = false">Close</orio-button>
  </orio-modal>
</template>

<script setup>
const { modalProps, openModal } = useModal();
</script>
```

Props: `delay` (500), `scale` (0.95), `forceTouch` (true), `disabled`
(false), `moveTolerance` (10). Events: `trigger`, `press-start`,
`press-cancel`.
````

- [ ] **Step 5: Write the composable agent doc**

Create `agents/composables/useLongPress.md`:

````md
---
kind: composable
category: Composables
purpose: long press detection, hold to trigger, force click, haptic touch, press and hold once
short: long-press detection on any element with move/cancel handling, Safari force click, and click swallow after trigger
invariants: true
---

# useLongPress — agent-only invariants

`useLongPress(target, options)` → `{ isPressing }`. Fires `onTrigger` once
per press. Use `<orio-long-press>` unless you need no scale feedback.

## Invariants

- **Must run inside a component setup / effect scope** — listeners use
  `useEventListener`; timer is cleared on scope dispose.
- **Options accept refs or getters** (`MaybeRefOrGetter`) and are read on
  each press — changing `delay` affects the next press.
- **`disabled` turning true mid-press cancels** (calls `onCancel`).
- **`onCancel` is not called after a trigger.**
- **Click swallow:** one `click` after a trigger is stopped in the capture
  phase on `target`; disarmed on the next pointerdown.
- **Nested targets:** first (innermost) handler claims the pointerdown.
- **Force:** `webkitmouseforcewillbegin` is `preventDefault`ed while
  `forceTouch` is on (suppresses Look Up); `webkitmouseforcedown` triggers
  with `source: "force"` only during an active press.
- **Not `usePressAndHold`** — that one fires immediately and repeats.

## Quick reference

```ts
// from docs/composables/use-long-press.md
const target = ref<HTMLElement | null>(null);

const { isPressing } = useLongPress(target, {
  delay: 600,
  onStart: () => log.value.unshift("start"),
  onCancel: () => log.value.unshift("cancel"),
  onTrigger: (event, source) => log.value.unshift(`trigger (${source})`),
});
```
````

- [ ] **Step 6: Narrow `usePressAndHold` routing purpose**

In `agents/composables/usePressAndHold.md`, replace line 4:

```
purpose: long-press detection, press-and-hold, auto-repeat, mousedown-hold ramp
```

with:

```
purpose: press-and-hold auto-repeat, repeat while held, spinner ramp, mousedown-hold ramp
```

- [ ] **Step 7: Regenerate routing and counts**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" node scripts/update-counts.mjs && PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" node scripts/generate-routing.mjs`
Expected: `CLAUDE.md` routing block gains `LongPress.vue` under "Buttons & indicators" and `useLongPress` under "Composables", both marked **Read the agent doc first.** Counts in `README.md` / `docs/index.md` go up by one component, one composable, two test suites.

Verify: `grep -n "LongPress\|useLongPress" CLAUDE.md`

- [ ] **Step 8: Final verification**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run`
Expected: all suites PASS (including `scripts` tests that check routing/agent docs).
