import { readFileSync } from "node:fs";
import fg from "fast-glob";

export const CATEGORY_ORDER = [
  "Layout & containers",
  "Form inputs",
  "Date",
  "Buttons & indicators",
  "Media & misc",
  "Composables",
];

export const ROOTS = {
  component: "src/runtime/components/",
  composable: "src/runtime/composables/",
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

export function derivePath(file, kind) {
  const root = ROOTS[kind];
  const rel = file.slice(file.indexOf(root) + root.length);
  if (rel.endsWith("/USAGE.md")) {
    return rel.replace(/USAGE\.md$/, "");
  }
  const stem = rel.replace(/\.USAGE\.md$/, "");
  return kind === "component" ? `${stem}.vue` : stem;
}

export function deriveUsagePath(file, kind) {
  const root = ROOTS[kind];
  return file.slice(file.indexOf(root) + root.length);
}

export function loadEntries() {
  const files = fg.sync([
    "src/runtime/components/**/*USAGE.md",
    "src/runtime/composables/**/*USAGE.md",
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
    if (!ROOTS[fm.kind]) {
      console.warn(`  skip (bad kind "${fm.kind}"): ${file}`);
      continue;
    }
    entries.push({
      ...fm,
      file,
      path: derivePath(file, fm.kind),
      usagePath: deriveUsagePath(file, fm.kind),
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
