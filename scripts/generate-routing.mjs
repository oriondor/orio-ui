/**
 * Generates the in-repo agent artifacts from their single sources of truth:
 *
 *   - CLAUDE.md routing block            ← USAGE.md frontmatter
 *   - .claude/agents/component-worker.md ← scripts/templates/bodies/component-worker.md
 *   - .claude/agents/component-finder.md ← scripts/templates/bodies/component-finder.md
 *   - README.md onboarding snippet       ← scripts/templates/consumer-snippet.md
 *
 * Run via the "prebuild" npm script. The companion postbuild script
 * `emit-consumer-agents.mjs` renders the same sources with consumer paths
 * into `dist/agents/` for downstream projects — shared renderers live in
 * `scripts/lib/` so the two can never drift.
 *
 * ============================================================================
 * USAGE.md frontmatter spec
 * ============================================================================
 *
 * Every reusable component and composable must ship a USAGE.md file with
 * YAML frontmatter at the top:
 *
 *   ---
 *   kind: component                   # "component" | "composable"
 *   category: Layout & containers     # one of CATEGORY_ORDER in load-entries
 *   purpose: modal, dialog, popup overlay, lightbox
 *   short: teleported overlay dialog with open-from-origin animation
 *   invariants: true                  # true → routing emits a read-first marker
 *   ---
 *
 * Fields:
 *   kind        Component lives under src/runtime/components/, composable
 *               under src/runtime/composables/.
 *   category    Group heading. New categories must be added to CATEGORY_ORDER.
 *   purpose     Comma-separated trigger phrases the routing agents match on.
 *               Used by component-worker / component-finder.
 *   short       One-sentence description used by the CLAUDE.md routing index.
 *               No trailing period — the renderer adds it.
 *   invariants  true if the USAGE.md body documents gotchas worth reading
 *               before integration; false for trivial wrappers (LoadingSpinner,
 *               view/Separator, useApi). Drives the "read USAGE.md first"
 *               marker — every entry ships a USAGE.md either way.
 *
 * File location → derived path:
 *   src/runtime/components/Modal.USAGE.md         → Modal.vue
 *   src/runtime/components/Canvas/USAGE.md        → Canvas/
 *   src/runtime/components/date/Picker.USAGE.md   → date/Picker.vue
 *   src/runtime/composables/useFilter.USAGE.md    → useFilter
 *
 * Stability: entries are emitted in a deterministic order (category order
 * fixed in load-entries, alphabetical by path inside each category). This
 * keeps the Anthropic prompt-cache prefix stable across runs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { loadEntries, groupAndSort } from "./lib/load-entries.mjs";
import {
  renderShortIndex,
  renderPurposeIndex,
  injectBetweenMarkers,
  fenceMarkdown,
} from "./lib/render-routing.mjs";
import { renderTemplate } from "./lib/render-template.mjs";

const REPO_VARS = {
  componentsRoot: "src/runtime/components/",
  composablesRoot: "src/runtime/composables/",
};

const AGENT_BODIES = [
  {
    body: "scripts/templates/bodies/component-worker.md",
    out: ".claude/agents/component-worker.md",
  },
  {
    body: "scripts/templates/bodies/component-finder.md",
    out: ".claude/agents/component-finder.md",
  },
];

function injectIntoFile(filePath, markerName, block) {
  const content = readFileSync(filePath, "utf8");
  const updated = injectBetweenMarkers(content, markerName, block);
  if (updated === content) return false;
  writeFileSync(filePath, updated);
  return true;
}

function main() {
  const printOnly = process.argv.includes("--print");
  const entries = loadEntries();
  const groups = groupAndSort(entries);
  const shortIndex = renderShortIndex(groups);
  const purposeIndex = renderPurposeIndex(groups);
  const snippet = readFileSync(
    "scripts/templates/consumer-snippet.md",
    "utf8",
  ).trimEnd();

  if (printOnly) {
    console.log(`\n===== short index =====\n\n${shortIndex}`);
    console.log(`\n===== purpose index =====\n\n${purposeIndex}`);
    console.log(
      `\nRouting: ${entries.length} entries (print mode, no files written)`,
    );
    return;
  }

  if (injectIntoFile("CLAUDE.md", "routing", shortIndex)) {
    console.log("  updated CLAUDE.md");
  }
  if (injectIntoFile("README.md", "snippet", fenceMarkdown(snippet))) {
    console.log("  updated README.md");
  }

  AGENT_BODIES.forEach(({ body, out }) => {
    const rendered = renderTemplate(readFileSync(body, "utf8"), {
      variant: "repo",
      vars: REPO_VARS,
    });
    const withRouting = injectBetweenMarkers(rendered, "routing", purposeIndex);
    writeFileSync(out, withRouting);
    console.log(`  rendered ${out}`);
  });

  console.log(`Routing: ${entries.length} entries`);
}

main();
