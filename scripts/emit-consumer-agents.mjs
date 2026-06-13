/**
 * Postbuild step: emits the consumer-facing agent bundle into `dist/agents/`
 * and mirrors every USAGE.md file into `dist/runtime/` alongside the compiled
 * component / composable sources.
 *
 * Shipped files:
 *   - dist/agents/ROUTING.md          ← scripts/templates/consumer-routing.md
 *   - dist/agents/component-worker.md ← scripts/templates/bodies/component-worker.md
 *   - dist/agents/component-finder.md ← scripts/templates/bodies/component-finder.md
 *   - dist/agents/snippet.md          ← scripts/templates/consumer-snippet.md
 *   - dist/runtime/.../<name>.USAGE.md ← copied from src/runtime/
 *
 * Consumers wire it up with `npx orio-ui agents` (see bin/orio-ui.mjs), which
 * appends `dist/agents/snippet.md` to their CLAUDE.md.
 *
 * Run as the `postbuild` npm script so it executes after `nuxt-module-build`
 * has populated `dist/`. Sources and renderers are shared with
 * `generate-routing.mjs` (see `scripts/lib/`) so the in-repo and shipped
 * routing never drift.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { loadEntries, groupAndSort, ROOTS } from "./lib/load-entries.mjs";
import {
  renderShortIndex,
  renderPurposeIndex,
  injectBetweenMarkers,
  fenceMarkdown,
} from "./lib/render-routing.mjs";
import { renderTemplate } from "./lib/render-template.mjs";

const DIST_AGENTS = "dist/agents";
const DIST_RUNTIME = "dist/runtime";

const CONSUMER_VARS = {
  componentsRoot: "node_modules/orio-ui/dist/runtime/components/",
  composablesRoot: "node_modules/orio-ui/dist/runtime/composables/",
};

const AGENT_BODIES = [
  {
    body: "scripts/templates/bodies/component-worker.md",
    out: `${DIST_AGENTS}/component-worker.md`,
  },
  {
    body: "scripts/templates/bodies/component-finder.md",
    out: `${DIST_AGENTS}/component-finder.md`,
  },
];

function emitAgents(groups, snippet) {
  const shortIndex = renderShortIndex(groups);
  const purposeIndex = renderPurposeIndex(groups);

  const routingTemplate = readFileSync(
    "scripts/templates/consumer-routing.md",
    "utf8",
  );
  let routing = injectBetweenMarkers(routingTemplate, "routing", shortIndex);
  routing = injectBetweenMarkers(routing, "snippet", fenceMarkdown(snippet));
  writeFileSync(`${DIST_AGENTS}/ROUTING.md`, routing);
  console.log(`  emitted ${DIST_AGENTS}/ROUTING.md`);

  AGENT_BODIES.forEach(({ body, out }) => {
    const rendered = renderTemplate(readFileSync(body, "utf8"), {
      variant: "consumer",
      vars: CONSUMER_VARS,
    });
    writeFileSync(out, injectBetweenMarkers(rendered, "routing", purposeIndex));
    console.log(`  emitted ${out}`);
  });

  writeFileSync(`${DIST_AGENTS}/snippet.md`, `${snippet}\n`);
  console.log(`  emitted ${DIST_AGENTS}/snippet.md`);
}

function copyUsageFiles(entries) {
  let copied = 0;
  entries.forEach((entry) => {
    const targetRoot = ROOTS[entry.kind].replace(/^src\//, "dist/");
    const out = join(targetRoot, entry.usagePath);
    mkdirSync(dirname(out), { recursive: true });
    copyFileSync(entry.file, out);
    copied += 1;
  });
  console.log(`  copied ${copied} USAGE.md file(s) into dist/runtime/`);
}

function main() {
  if (!existsSync(DIST_RUNTIME)) {
    console.error(
      `  error: ${DIST_RUNTIME} does not exist — run the build before this script`,
    );
    process.exit(1);
  }
  const entries = loadEntries();
  const groups = groupAndSort(entries);
  const snippet = readFileSync(
    "scripts/templates/consumer-snippet.md",
    "utf8",
  ).trimEnd();
  mkdirSync(DIST_AGENTS, { recursive: true });
  emitAgents(groups, snippet);
  copyUsageFiles(entries);
  console.log(`Consumer agents: ${entries.length} entries`);
}

main();
