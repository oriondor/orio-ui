import { existsSync, readFileSync } from "node:fs";
import fg from "fast-glob";

export const CATEGORY_ORDER = [
  "Layout & containers",
  "Form inputs",
  "Date",
  "Buttons & indicators",
  "Media & misc",
  "Composables",
];

/** Where the sources live. */
export const ROOTS = {
  component: "src/runtime/components/",
  composable: "src/runtime/composables/",
};

/** Where the agent docs live — a mirror of ROOTS, one `.md` per entry. */
export const DOC_ROOTS = {
  component: "agents/components/",
  composable: "agents/composables/",
};

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split("\n")) {
    const fieldMatch = line.match(/^(\w+):\s*(.*)$/);
    if (!fieldMatch) continue;
    let value = fieldMatch[2].trim();
    if (value === "true") value = true;
    else if (value === "false") value = false;
    data[fieldMatch[1]] = value;
  }
  return data;
}

/**
 * Agent doc path → source path.
 *
 * `index.md` always means a folder component (`NumberInput/index.md` →
 * `NumberInput/`). A flat `<Name>.md` is ambiguous on its own — `Button.md` is
 * `Button.vue`, but `Canvas.md` is the folder component `Canvas/` — so the
 * folder form is confirmed against the filesystem rather than guessed.
 */
export function derivePath(file, kind) {
  const rel = deriveDocPath(file, kind);
  if (rel.endsWith("/index.md")) {
    return rel.replace(/index\.md$/, "");
  }
  const stem = rel.replace(/\.md$/, "");
  if (kind !== "component") return stem;
  return existsSync(`${ROOTS[kind]}${stem}/`) ? `${stem}/` : `${stem}.vue`;
}

/** Agent doc path relative to its doc root — the layout mirrored into dist/. */
export function deriveDocPath(file, kind) {
  const root = DOC_ROOTS[kind];
  return file.slice(file.indexOf(root) + root.length);
}

export function loadEntries() {
  const files = fg.sync([
    `${DOC_ROOTS.component}**/*.md`,
    `${DOC_ROOTS.composable}**/*.md`,
  ]);
  const entries = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      console.warn(`  skip (no frontmatter): ${file}`);
      continue;
    }
    const missing = ["kind", "category", "purpose", "short"].filter(
      (key) => fm[key] === undefined || fm[key] === "",
    );
    if (missing.length) {
      console.warn(`  skip (missing ${missing.join(", ")}): ${file}`);
      continue;
    }
    if (!DOC_ROOTS[fm.kind]) {
      console.warn(`  skip (bad kind "${fm.kind}"): ${file}`);
      continue;
    }
    entries.push({
      ...fm,
      file,
      path: derivePath(file, fm.kind),
      docPath: deriveDocPath(file, fm.kind),
    });
  }
  return entries;
}

export function groupAndSort(entries) {
  const groups = new Map();
  for (const cat of CATEGORY_ORDER) groups.set(cat, []);
  for (const entry of entries) {
    if (!groups.has(entry.category)) {
      console.warn(
        `  warn (unknown category "${entry.category}"): ${entry.file}`,
      );
      groups.set(entry.category, []);
    }
    groups.get(entry.category).push(entry);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.path.localeCompare(b.path));
  }
  return groups;
}
