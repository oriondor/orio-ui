# orio-ui — agent routing index

This file is shipped inside the published `orio-ui` package. Point your AI
coding agent here so it can discover every reusable component and composable
that ships with the library instead of exploring the package source blindly.

**Path:** `node_modules/orio-ui/dist/agents/ROUTING.md`

## How to wire it up

Run once in your project root:

```bash
npx orio-ui agents
```

It appends the snippet below to your `CLAUDE.md` (creating the file if
missing). Or paste it yourself — into `CLAUDE.md`, `AGENTS.md`,
`.cursorrules`, or whatever instruction file your tooling reads:

<!-- snippet:start -->
<!-- snippet:end -->

## Optional subagents

If your AI tooling supports subagents (e.g. Claude Code's `.claude/agents/`),
copy the shipped definitions in:

```bash
mkdir -p .claude/agents
cp node_modules/orio-ui/dist/agents/component-worker.md .claude/agents/
cp node_modules/orio-ui/dist/agents/component-finder.md .claude/agents/
```

- `component-worker.md` — picks the right component for a vague request, reads
  its agent doc, then implements the integration in your app.
- `component-finder.md` — read-only; locates a component and returns paths
  without writing code.

Re-copy after `orio-ui` upgrades so the embedded routing table tracks the
installed version.

## Conventions

- Auto-import prefix is `Orio`. `Modal.vue` → `<orio-modal>`. Nested folder
  components: `Canvas/components/Stage.vue` → `<orio-canvas-stage>`.
- Paths below are relative to `node_modules/orio-ui/dist/runtime/components/`
  for components and `node_modules/orio-ui/dist/runtime/composables/` for
  composables.
- Every entry ships an agent-only doc, in a mirror tree under
  `node_modules/orio-ui/dist/agents/`: `Modal.vue` →
  `dist/agents/components/Modal.md`, `useFilter` →
  `dist/agents/composables/useFilter.md`. Entries marked **Read the agent doc
  first.** document non-trivial invariants/gotchas — read them before
  integrating.

## Components & composables

<!-- routing:start -->
<!-- routing:end -->

## Public API reference

The hand-written public API docs live under `docs/components/` and
`docs/composables/` in the source repo and at https://orio-ui.vercel.app/.
They are not shipped inside this package — use them as a complement when you
need exhaustive prop/slot/event detail.
