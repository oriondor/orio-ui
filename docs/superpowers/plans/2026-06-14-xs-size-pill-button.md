# xs Control Size + Pill Button + Vertical NumberInput Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-class `xs` control size and a `pill` Button prop, then use them to fix the oversized stacked chevron buttons in the vertical NumberInput variant.

**Architecture:** Three additive changes. (1) Extend the `ControlSize` union and add an `xs` token bag to `sizeTokens`. (2) Add a `pill` boolean to `Button` that swaps in `--border-radius-pill`. (3) Switch the vertical NumberInput chevrons to `size="xs"` + `pill` and tighten their scoped CSS so they fit the field. The horizontal variant and global icon-only button geometry are untouched.

**Tech Stack:** Vue 3 (`<script setup lang="ts">`), Nuxt module, SCSS, Vitest + @vue/test-utils.

---

## Environment note

The machine's default `node` is a broken v16. **Prefix every npm/npx/vitest command** with the node 24 bin on PATH:

```bash
PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run <args>
```

All `Run:` commands below assume this prefix.

## File structure

- `src/runtime/components/ControlElement.vue` — Modify line 8: extend `ControlSize` union with `"xs"`.
- `src/runtime/composables/useControlSize.ts` — Modify `sizeTokens` (currently starts line 13): add an `xs` entry as the first key.
- `src/runtime/components/Button.vue` — Modify: add `pill?: boolean` prop, a `pill` class binding, and a `.pill` style rule.
- `src/runtime/components/NumberInput/Vertical.vue` — Modify: chevron buttons get `size="xs"` + `pill`; tighten `.vertical :deep(.controls)` CSS.
- `src/runtime/composables/useControlSize.USAGE.md` — Modify: size enumeration `sm/md/lg/xl` → `xs/sm/md/lg/xl`.
- `tests/composables/useControlSize.spec.ts` — Create: assert the `xs` token bag.
- `tests/components/Button.spec.ts` — Modify: add `pill` class tests.
- `tests/components/NumberInputVertical.spec.ts` — Modify: assert chevrons use `size="xs"` + `pill`.

---

## Task 1: Add the `xs` token bag to `useControlSize`

**Files:**
- Modify: `src/runtime/components/ControlElement.vue:8`
- Modify: `src/runtime/composables/useControlSize.ts` (the `sizeTokens` object)
- Test: `tests/composables/useControlSize.spec.ts` (create)

- [ ] **Step 1: Extend the `ControlSize` union**

In `src/runtime/components/ControlElement.vue`, line 8, change:

```ts
export type ControlSize = "sm" | "md" | "lg" | "xl";
```

to:

```ts
export type ControlSize = "xs" | "sm" | "md" | "lg" | "xl";
```

(This is a prerequisite so the `xs` key on the typed `sizeTokens` record compiles; do it in this step, no separate test.)

- [ ] **Step 2: Write the failing test for the `xs` token bag**

Create `tests/composables/useControlSize.spec.ts`:

```ts
import { describe, it, expect } from "vitest";
import { sizeTokens } from "../../src/runtime/composables/useControlSize";

describe("useControlSize sizeTokens", () => {
  it("exposes an xs entry", () => {
    expect(sizeTokens.xs).toBeDefined();
  });

  it("xs keeps font readable (same as sm) but tightens spacing", () => {
    expect(sizeTokens.xs["--control-font-size"]).toBe("var(--font-sm)");
    expect(sizeTokens.xs["--control-py"]).toBe("0.125rem");
    expect(sizeTokens.xs["--control-px"]).toBe("0.25rem");
    expect(sizeTokens.xs["--control-gap"]).toBe("0.125rem");
    expect(sizeTokens.xs["--control-icon-size"]).toBe("0.625rem");
    expect(sizeTokens.xs["--control-radius"]).toBe("var(--border-radius-sm)");
  });

  it("xs defines the same token keys as sm", () => {
    expect(Object.keys(sizeTokens.xs).sort()).toEqual(
      Object.keys(sizeTokens.sm).sort(),
    );
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/composables/useControlSize.spec.ts`
Expected: FAIL — `sizeTokens.xs` is undefined.

- [ ] **Step 4: Add the `xs` entry**

In `src/runtime/composables/useControlSize.ts`, add `xs` as the first key of the `sizeTokens` object (immediately after `const sizeTokens: Record<ControlSize, Record<string, string>> = {`), before the `sm:` entry:

```ts
  xs: {
    "--control-font-size": "var(--font-sm)",
    "--control-label-font-size": "var(--font-xs)",
    "--control-py": "0.125rem",
    "--control-px": "0.25rem",
    "--control-gap": "0.125rem",
    "--control-radius": "var(--border-radius-sm)",
    "--control-icon-size": "0.625rem",
    "--control-inner-block-start": "0.85rem",
    "--control-inner-block-end": "0.1rem",
    "--control-label-block-start": "0.15rem",
  },
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/composables/useControlSize.spec.ts`
Expected: PASS (all three tests).

- [ ] **Step 6: Update the USAGE.md size enumeration**

In `src/runtime/composables/useControlSize.USAGE.md`, replace every occurrence of the size list `sm/md/lg/xl` with `xs/sm/md/lg/xl` (e.g. the `short:` frontmatter line and any prose listing the sizes). Do not change anything else.

- [ ] **Step 7: Commit**

```bash
git add src/runtime/components/ControlElement.vue src/runtime/composables/useControlSize.ts src/runtime/composables/useControlSize.USAGE.md tests/composables/useControlSize.spec.ts
git commit -m "feat(control): add first-class xs control size"
```

---

## Task 2: Add the `pill` prop to `Button`

**Files:**
- Modify: `src/runtime/components/Button.vue` (Props interface, class binding, styles)
- Test: `tests/components/Button.spec.ts`

- [ ] **Step 1: Write the failing tests for the `pill` class**

In `tests/components/Button.spec.ts`, add these two tests inside the `describe("Button", ...)` block (after the existing `"applies variant class"` test, before the closing `});`):

```ts
  it("applies pill class when pill is true", () => {
    const wrapper = mount(Button, {
      props: { pill: true, icon: "check" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    expect(wrapper.find("button").classes()).toContain("pill");
  });

  it("does not apply pill class by default", () => {
    const wrapper = mount(Button, {
      props: { icon: "check" },
      global: {
        stubs: {
          "orio-control-element": ControlStub,
          "orio-icon": IconStub,
          "orio-loading-spinner": LoadingStub,
        },
      },
    });

    expect(wrapper.find("button").classes()).not.toContain("pill");
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/components/Button.spec.ts`
Expected: FAIL on `"applies pill class when pill is true"` — `pill` class is missing.

- [ ] **Step 3: Add the `pill` prop**

In `src/runtime/components/Button.vue`, extend the `Props` interface (currently lines 5-9) to add `pill`:

```ts
interface Props extends ControlProps {
  variant?: "primary" | "secondary" | "subdued";
  icon?: string;
  loading?: boolean;
  pill?: boolean;
}
```

- [ ] **Step 4: Add the `pill` class binding**

In the template, change the button's `:class` (currently line 55) from:

```html
:class="[variant, 'gradient-hover', { 'icon-only': isIconOnly }]"
```

to:

```html
:class="[variant, 'gradient-hover', { 'icon-only': isIconOnly, pill }]"
```

- [ ] **Step 5: Add the `.pill` style rule**

In the `<style lang="scss" scoped>` block, inside the `button { ... }` selector, add a `&.pill` rule (place it next to the `&.icon-only` rule, after it):

```scss
  &.pill {
    border-radius: var(--border-radius-pill);
  }
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/components/Button.spec.ts`
Expected: PASS (all Button tests, including the two new ones).

- [ ] **Step 7: Commit**

```bash
git add src/runtime/components/Button.vue tests/components/Button.spec.ts
git commit -m "feat(button): add pill prop for fully-rounded radius"
```

---

## Task 3: Apply `xs` + `pill` to the vertical NumberInput chevrons

**Files:**
- Modify: `src/runtime/components/NumberInput/Vertical.vue`
- Test: `tests/components/NumberInputVertical.spec.ts`

- [ ] **Step 1: Write the failing tests for chevron size + pill**

In `tests/components/NumberInputVertical.spec.ts`, add these tests inside the `describe("NumberInputVertical", ...)` block (after the `"renders chevron-down button second"` test):

```ts
  it("renders chevron buttons at xs size", () => {
    const wrapper = mount(NumberInputVertical);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[0].props("size")).toBe("xs");
    expect(buttons[1].props("size")).toBe("xs");
  });

  it("renders chevron buttons as pills", () => {
    const wrapper = mount(NumberInputVertical);
    const buttons = wrapper.findAllComponents(Button);
    expect(buttons[0].props("pill")).toBe(true);
    expect(buttons[1].props("pill")).toBe(true);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/components/NumberInputVertical.spec.ts`
Expected: FAIL — current buttons have `size="sm"` and no `pill` prop.

- [ ] **Step 3: Update the chevron buttons**

In `src/runtime/components/NumberInput/Vertical.vue`, change both `<orio-button>` elements so each has `size="xs"` (replacing the existing `size="sm"`) and `pill`. The up button becomes:

```html
      <orio-button
        appearance="minimal"
        icon="chevron-up"
        variant="subdued"
        size="xs"
        pill
        :disabled="isAtMax || disabled"
        @mousedown="pressAndHold(increase)"
        @mouseup="stop"
        @mouseleave="stop"
      />
```

and the down button becomes:

```html
      <orio-button
        appearance="minimal"
        icon="chevron-down"
        variant="subdued"
        size="xs"
        pill
        :disabled="isAtMin || disabled"
        @mousedown="pressAndHold(decrease)"
        @mouseup="stop"
        @mouseleave="stop"
      />
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run tests/components/NumberInputVertical.spec.ts`
Expected: PASS (all NumberInputVertical tests).

- [ ] **Step 5: Tighten the vertical controls CSS**

In `src/runtime/components/NumberInput/Vertical.vue`, update the `.vertical :deep(.controls)` rule so the two stacked chevrons fit the field height. Replace the existing `:deep(.controls)` block with:

```scss
  :deep(.controls) {
    flex-direction: column;
    justify-content: center;
    gap: 0;
    right: 3px;
    left: auto;
  }

  :deep(.controls button) {
    padding-block: 0;
  }
```

Keep the existing `:deep(.slot-wrapper) { line-height: 0; }` block unchanged.

- [ ] **Step 6: Run the full test suite to confirm no regressions**

Run: `PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npx vitest run`
Expected: PASS — entire suite green.

- [ ] **Step 7: Visual check**

Run the docs/dev harness and confirm both vertical chevrons sit inside the field (no overflow) at the default `md` field size and at `sm`, and that the horizontal variant is unchanged:

```bash
PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" npm run dev
```

Open the NumberInput docs/demo page in the browser. Confirm visually, then stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add src/runtime/components/NumberInput/Vertical.vue tests/components/NumberInputVertical.spec.ts
git commit -m "fix(number-input): size vertical chevrons with xs + pill so they fit the field"
```

---

## Self-review notes

- **Spec coverage:** xs first-class size → Task 1. pill Button prop → Task 2. Vertical uses xs+pill and scoped CSS fix → Task 3. USAGE.md size list → Task 1 Step 6. Non-goals (no global icon-only geometry change, horizontal untouched) honored — only `.vertical`-scoped CSS changes.
- **Type consistency:** `ControlSize` union updated before the typed `sizeTokens` record gains its `xs` key (Task 1 Steps 1 & 4). `pill` prop name consistent across Button definition, class binding, test, and Vertical usage.
- **No placeholders:** all token values, class names, and code blocks are concrete. The CSS values in Task 1 Step 4 and Task 3 Step 5 are the implementation starting point; if the visual check (Task 3 Step 7) shows overflow, adjust `--control-icon-size`/`--control-py` on the `xs` bag or the `.controls` gap before committing Task 3.
