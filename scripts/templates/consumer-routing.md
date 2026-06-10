# orio-ui — agent routing index

This file is shipped inside the published `orio-ui` package. Reference it from
your consumer project's `CLAUDE.md` (or equivalent) so AI coding agents can
discover every reusable component and composable that ships with the library.

**Path:** `node_modules/orio-ui/dist/agents/ROUTING.md`

## How to wire it up

Add this block to your project's `CLAUDE.md`:

```md
# orio-ui

This project consumes the [orio-ui](https://orio-ui.vercel.app/) Vue 3 component
library. For the full component / composable list and per-component invariants:

- Routing index: `node_modules/orio-ui/dist/agents/ROUTING.md`
- Per-component USAGE.md: `node_modules/orio-ui/dist/runtime/components/<name>.USAGE.md`
- Per-composable USAGE.md: `node_modules/orio-ui/dist/runtime/composables/<name>.USAGE.md`

Optional subagents (copy to `.claude/agents/` to enable):
- `node_modules/orio-ui/dist/agents/component-worker.md` — integrate components into your app.
- `node_modules/orio-ui/dist/agents/component-finder.md` — locate the right component for a vague request.
```

## Conventions

- Auto-import prefix is `Orio`. `Modal.vue` → `<orio-modal>`. Nested folder
  components: `Canvas/components/Stage.vue` → `<orio-canvas-stage>`.
- Paths below are relative to `node_modules/orio-ui/dist/runtime/components/`
  for components and `node_modules/orio-ui/dist/runtime/composables/` for
  composables.
- Entries marked **Has USAGE.md** ship an agent-only invariants/gotchas file
  next to the source. Read it before integrating.

## Components & composables

<!-- routing:start -->
<!-- routing:end -->

## Public API reference

The hand-written public API docs live under `docs/components/` and
`docs/composables/` in the source repo and at https://orio-ui.vercel.app/.
They are not shipped inside this package — use them as a complement when you
need exhaustive prop/slot/event detail.
