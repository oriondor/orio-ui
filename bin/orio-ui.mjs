#!/usr/bin/env node
/**
 * Consumer-side CLI. `npx orio-ui agents` wires the consumer project's
 * CLAUDE.md to the agent docs shipped in `dist/agents/`. The snippet it
 * appends lives in `dist/agents/snippet.md` (source of truth:
 * `scripts/templates/consumer-snippet.md` in the orio-ui repo).
 */
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROUTING_POINTER = "node_modules/orio-ui/dist/agents/ROUTING.md";

const USAGE = `Usage: npx orio-ui agents

  agents   Append the orio-ui agent-onboarding snippet to ./CLAUDE.md
           (creates the file if missing; no-op when already wired).
`;

export function runAgentsCommand({ cwd, snippetPath }) {
  if (!existsSync(snippetPath)) {
    throw new Error(
      `Snippet not found at ${snippetPath} — run \`npm run build\` in the orio-ui repo first.`,
    );
  }
  const snippet = readFileSync(snippetPath, "utf8");
  const claudeFilePath = join(cwd, "CLAUDE.md");

  if (!existsSync(claudeFilePath)) {
    writeFileSync(claudeFilePath, snippet);
    return { status: "created", file: claudeFilePath };
  }

  const existingContent = readFileSync(claudeFilePath, "utf8");
  if (existingContent.includes(ROUTING_POINTER)) {
    return { status: "already-wired", file: claudeFilePath };
  }

  writeFileSync(claudeFilePath, `${existingContent}\n${snippet}`);
  return { status: "appended", file: claudeFilePath };
}

function main() {
  const [command] = process.argv.slice(2);
  if (command !== "agents") {
    console.error(USAGE);
    process.exit(1);
  }

  const binDirectory = dirname(fileURLToPath(import.meta.url));
  const snippetPath = join(binDirectory, "../dist/agents/snippet.md");

  try {
    const result = runAgentsCommand({ cwd: process.cwd(), snippetPath });
    const messages = {
      created: `Created ${result.file} with the orio-ui agent snippet.`,
      appended: `Appended the orio-ui agent snippet to ${result.file}.`,
      "already-wired": `${result.file} already references ${ROUTING_POINTER} — nothing to do.`,
    };
    console.log(messages[result.status]);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

const invokedDirectly =
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main();
}
