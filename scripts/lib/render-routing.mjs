/**
 * Shared renderers for the routing index generated from USAGE.md frontmatter.
 * Used by `generate-routing.mjs` (in-repo targets) and
 * `emit-consumer-agents.mjs` (shipped `dist/agents/` targets) so the two can
 * never drift.
 *
 * Marker semantics: every component/composable ships a USAGE.md. Entries
 * whose frontmatter has `invariants: true` get a "read USAGE.md first"
 * marker — their USAGE.md documents non-trivial invariants/gotchas that must
 * be read before integrating. Unmarked entries still have a USAGE.md, it is
 * just a thin summary.
 */

/** CLAUDE.md / ROUTING.md style: `path` — short description. */
export function renderShortIndex(groups) {
  const sections = [];
  for (const [category, list] of groups) {
    if (list.length === 0) continue;
    const lines = [`### ${category}`];
    for (const entry of list) {
      const marker = entry.invariants ? " **Read USAGE.md first.**" : "";
      lines.push(`- \`${entry.path}\` — ${entry.short}.${marker}`);
    }
    sections.push(lines.join("\n"));
  }
  return sections.join("\n\n");
}

/** Subagent style: **purpose phrases** → `path`. */
export function renderPurposeIndex(groups) {
  const sections = [];
  for (const [category, list] of groups) {
    if (list.length === 0) continue;
    const lines = [`### ${category}`];
    for (const entry of list) {
      const marker = entry.invariants ? " (read USAGE.md first)" : "";
      lines.push(`- **${entry.purpose}** → \`${entry.path}\`${marker}`);
    }
    sections.push(lines.join("\n"));
  }
  return sections.join("\n\n");
}

/**
 * Wrap the onboarding snippet in a ```md fence for copy-paste display. The
 * fence length is one backtick longer than the longest backtick run inside the
 * snippet (minimum three) so nested code fences can't close the outer block.
 */
export function fenceMarkdown(snippet) {
  const longestRun = Math.max(
    0,
    ...[...snippet.matchAll(/`+/g)].map((match) => match[0].length),
  );
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return `${fence}md\n${snippet}\n${fence}`;
}

/** Replace everything between `<!-- <name>:start -->` / `<!-- <name>:end -->`. */
export function injectBetweenMarkers(content, markerName, block) {
  const start = `<!-- ${markerName}:start -->`;
  const end = `<!-- ${markerName}:end -->`;
  const markerRegion = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!markerRegion.test(content)) {
    throw new Error(`missing ${markerName} markers`);
  }
  return content.replace(markerRegion, `${start}\n${block}\n${end}`);
}
