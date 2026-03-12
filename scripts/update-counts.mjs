/**
 * Updates component, composable, and test counts in README.md and docs/index.md.
 * Runs automatically before build via the "prebuild" npm script.
 */
import { readFileSync, writeFileSync } from "node:fs";
import fg from "fast-glob";

const components = fg.sync("src/runtime/components/**/*.vue").length;
const composables = fg.sync("src/runtime/composables/*.ts").length;
const tests = fg.sync("tests/**/*.spec.ts").length;

const replacements = [
  [/\*\*\d+ Components\*\*/, `**${components} Components**`],
  [/\*\*Tested\*\* - [\d+]+ unit tests/, `**Tested** - ${tests} test suites`],
  [/### Components \(\d+\)/, `### Components (${components})`],
  [/### Composables \(\d+\)/, `### Composables (${composables})`],
  [/# \d+ Vue components/, `# ${components} Vue components`],
  [/# \d+ composables/, `# ${composables} composables`],
];

const files = ["README.md", "docs/index.md"];
let changed = false;

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  let updated = content;
  for (const [pattern, replacement] of replacements) {
    updated = updated.replace(pattern, replacement);
  }

  if (updated !== content) {
    writeFileSync(file, updated);
    changed = true;
    console.log(`  updated ${file}`);
  }
}

console.log(
  `Counts: ${components} components, ${composables} composables, ${tests} test suites${changed ? "" : " (no changes)"}`,
);
