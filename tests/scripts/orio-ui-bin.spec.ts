import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
// @ts-ignore — plain .mjs module without type declarations
import { runAgentsCommand } from "../../bin/orio-ui.mjs";

const SNIPPET = `## orio-ui

orio-ui ships agent-ready docs inside the package itself. Before answering
anything about orio-ui components/composables, read
\`node_modules/orio-ui/dist/agents/ROUTING.md\` — it routes to per-component
agent docs and optional subagents. Don't explore the package source blindly.
`;

describe("orio-ui agents bin", () => {
  let workDir: string;
  let snippetPath: string;

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "orio-ui-bin-"));
    snippetPath = join(workDir, "snippet.md");
    writeFileSync(snippetPath, SNIPPET);
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
  });

  it("creates CLAUDE.md with the snippet when the file is missing", () => {
    const result = runAgentsCommand({ cwd: workDir, snippetPath });

    expect(result.status).toBe("created");
    const content = readFileSync(join(workDir, "CLAUDE.md"), "utf8");
    expect(content).toBe(SNIPPET);
  });

  it("appends the snippet to an existing CLAUDE.md, preserving content", () => {
    const existing = "# My app\n\nSome instructions.\n";
    writeFileSync(join(workDir, "CLAUDE.md"), existing);

    const result = runAgentsCommand({ cwd: workDir, snippetPath });

    expect(result.status).toBe("appended");
    const content = readFileSync(join(workDir, "CLAUDE.md"), "utf8");
    expect(content.startsWith(existing)).toBe(true);
    expect(content).toContain("node_modules/orio-ui/dist/agents/ROUTING.md");
    expect(content).toBe(`${existing}\n${SNIPPET}`);
  });

  it("is idempotent — second run leaves the file unchanged", () => {
    runAgentsCommand({ cwd: workDir, snippetPath });
    const firstPass = readFileSync(join(workDir, "CLAUDE.md"), "utf8");

    const result = runAgentsCommand({ cwd: workDir, snippetPath });

    expect(result.status).toBe("already-wired");
    expect(readFileSync(join(workDir, "CLAUDE.md"), "utf8")).toBe(firstPass);
  });

  it("throws a build hint when the snippet file is missing", () => {
    rmSync(snippetPath);

    expect(() => runAgentsCommand({ cwd: workDir, snippetPath })).toThrow(
      /npm run build/,
    );
  });
});
