/**
 * Postbuild step: emits a consumer-facing agent bundle into `dist/agents/` and
 * mirrors every USAGE.md file into `dist/runtime/` alongside the compiled
 * component / composable sources.
 *
 * Consumers reference these paths from their own `CLAUDE.md`:
 *   - node_modules/orio-ui/dist/agents/ROUTING.md
 *   - node_modules/orio-ui/dist/agents/component-worker.md
 *   - node_modules/orio-ui/dist/agents/component-finder.md
 *   - node_modules/orio-ui/dist/runtime/components/<name>.USAGE.md
 *   - node_modules/orio-ui/dist/runtime/composables/<name>.USAGE.md
 *
 * Run as the `postbuild` npm script so it executes after `nuxt-module-build`
 * has populated `dist/`. The routing block source-of-truth is the same
 * USAGE.md frontmatter that `generate-routing.mjs` reads — kept identical so
 * the in-repo and shipped routing never drift.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import {
  loadEntries,
  groupAndSort,
  ROOTS,
} from "./lib/load-entries.mjs";

const DIST_AGENTS = "dist/agents";
const DIST_RUNTIME = "dist/runtime";

const TEMPLATES = [
  {
    src: "scripts/templates/consumer-routing.md",
    out: `${DIST_AGENTS}/ROUTING.md`,
    format: "claude",
  },
  {
    src: "scripts/templates/consumer-component-worker.md",
    out: `${DIST_AGENTS}/component-worker.md`,
    format: "worker",
  },
  {
    src: "scripts/templates/consumer-component-finder.md",
    out: `${DIST_AGENTS}/component-finder.md`,
    format: "finder",
  },
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

function injectIntoTemplate(templateContent, block) {
  const start = "<!-- routing:start -->";
  const end = "<!-- routing:end -->";
  const regex = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!regex.test(templateContent)) {
    throw new Error("template missing routing markers");
  }
  return templateContent.replace(regex, `${start}\n${block}\n${end}`);
}

function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function emitAgents(groups) {
  const renderers = {
    claude: renderClaude,
    worker: renderWorker,
    finder: renderFinder,
  };
  for (const { src, out, format } of TEMPLATES) {
    const template = readFileSync(src, "utf8");
    const block = renderers[format](groups);
    const rendered = injectIntoTemplate(template, block);
    ensureDir(out);
    writeFileSync(out, rendered);
    console.log(`  emitted ${out}`);
  }
}

function copyUsageFiles(entries) {
  let copied = 0;
  let missing = 0;
  for (const entry of entries) {
    const targetRoot = ROOTS[entry.kind].replace(/^src\//, "dist/");
    const out = join(targetRoot, entry.usagePath);
    if (!existsSync(dirname(out))) {
      mkdirSync(dirname(out), { recursive: true });
    }
    if (!existsSync(entry.file)) {
      console.warn(`  skip (source missing): ${entry.file}`);
      missing += 1;
      continue;
    }
    copyFileSync(entry.file, out);
    copied += 1;
  }
  console.log(
    `  copied ${copied} USAGE.md file(s) into dist/runtime/${missing ? ` (${missing} missing)` : ""}`,
  );
}

function main() {
  if (!existsSync(DIST_RUNTIME)) {
    console.warn(
      `  skip: ${DIST_RUNTIME} does not exist — run the build before this script`,
    );
    process.exit(0);
  }
  const entries = loadEntries();
  const groups = groupAndSort(entries);
  mkdirSync(DIST_AGENTS, { recursive: true });
  emitAgents(groups);
  copyUsageFiles(entries);
  console.log(`Consumer agents: ${entries.length} entries`);
}

main();
