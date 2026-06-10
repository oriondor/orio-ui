/**
 * Generates the component/composable routing index from USAGE.md files and
 * injects it into CLAUDE.md, .claude/agents/component-worker.md, and
 * .claude/agents/component-finder.md between routing markers.
 *
 * Run via the "prebuild" npm script. The companion postbuild script
 * `emit-consumer-agents.mjs` emits the same routing into `dist/agents/` for
 * downstream consumer projects.
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
 *   category: Layout & containers     # one of CATEGORY_ORDER below
 *   purpose: modal, dialog, popup overlay, lightbox
 *   short: teleported overlay dialog with open-from-origin animation
 *   invariants: true                  # true → routing emits a "USAGE.md" marker
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
 *               before integration; false for trivial wrappers (Button, Tag,
 *               Badge). Drives the "(USAGE.md)" / "Has USAGE.md" marker.
 *
 * File location → derived path:
 *   src/runtime/components/Modal.USAGE.md         → Modal.vue
 *   src/runtime/components/Canvas/USAGE.md        → Canvas/
 *   src/runtime/components/date/Picker.USAGE.md   → date/Picker.vue
 *   src/runtime/composables/useFilter.USAGE.md    → useFilter
 *
 * ============================================================================
 * Target file markers
 * ============================================================================
 *
 * Each target file must contain a pair of markers; the script replaces
 * everything between them:
 *
 *   <!-- routing:start -->
 *   ...generated...
 *   <!-- routing:end -->
 *
 * Stability: entries are emitted in a deterministic order (category order
 * fixed below, alphabetical by path inside each category). This keeps the
 * Anthropic prompt-cache prefix stable across runs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { loadEntries, groupAndSort } from "./lib/load-entries.mjs";

const TARGETS = [
  { file: "CLAUDE.md", format: "claude" },
  { file: ".claude/agents/component-worker.md", format: "worker" },
  { file: ".claude/agents/component-finder.md", format: "finder" },
];

function renderClaude(groups) {
  const sections = [];
  for (const [cat, list] of groups) {
    if (list.length === 0) continue;
    const lines = [`### ${cat}`];
    for (const entry of list) {
      const marker = entry.invariants ? " **Has USAGE.md.**" : "";
      lines.push(`- \`${entry.path}\` — ${entry.short}.${marker}`);
    }
    sections.push(lines.join("\n"));
  }
  return sections.join("\n\n");
}

function renderWorker(groups) {
  const sections = [];
  for (const [cat, list] of groups) {
    if (list.length === 0) continue;
    const lines = [`### ${cat}`];
    for (const entry of list) {
      const marker = entry.invariants ? " (USAGE.md)" : "";
      lines.push(`- **${entry.purpose}** → \`${entry.path}\`${marker}`);
    }
    sections.push(lines.join("\n"));
  }
  return sections.join("\n\n");
}

function renderFinder(groups) {
  const sections = [];
  for (const [cat, list] of groups) {
    if (list.length === 0) continue;
    const lines = [`### ${cat}`];
    for (const entry of list) {
      const marker = entry.invariants ? " (has `USAGE.md`)" : "";
      lines.push(`- **${entry.purpose}** → \`${entry.path}\`${marker}`);
    }
    sections.push(lines.join("\n"));
  }
  return sections.join("\n\n");
}

function inject(filePath, block) {
  let content;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    console.warn(`  skip (not found): ${filePath}`);
    return false;
  }
  const start = "<!-- routing:start -->";
  const end = "<!-- routing:end -->";
  const regex = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!regex.test(content)) {
    console.warn(`  skip (no markers): ${filePath}`);
    return false;
  }
  const updated = content.replace(regex, `${start}\n${block}\n${end}`);
  if (updated === content) return false;
  writeFileSync(filePath, updated);
  return true;
}

function main() {
  const printOnly = process.argv.includes("--print");
  const entries = loadEntries();
  const groups = groupAndSort(entries);
  const renderers = {
    claude: renderClaude,
    worker: renderWorker,
    finder: renderFinder,
  };

  if (printOnly) {
    for (const { file, format } of TARGETS) {
      console.log(`\n===== ${file} =====\n`);
      console.log(renderers[format](groups));
    }
    console.log(
      `\nRouting: ${entries.length} entries (print mode, no files written)`,
    );
    return;
  }

  let changed = false;
  for (const { file, format } of TARGETS) {
    if (inject(file, renderers[format](groups))) {
      changed = true;
      console.log(`  updated ${file}`);
    }
  }
  console.log(
    `Routing: ${entries.length} entries${changed ? "" : " (no changes)"}`,
  );
}

main();
