/**
 * PostToolUse hook (Write|Edit) — see .claude/settings.json.
 *
 * When a component/composable source file under src/runtime/ is created or
 * edited, injects a reminder into the model context to dispatch the
 * `usage-auditor` subagent (.claude/agents/usage-auditor.md) so the related
 * USAGE.md is audited for drift. Silent for USAGE.md files themselves and for
 * anything outside src/runtime/.
 */
let rawInput = "";
process.stdin.on("data", (chunk) => {
  rawInput += chunk;
});
process.stdin.on("end", () => {
  let filePath = "";
  try {
    filePath = JSON.parse(rawInput).tool_input?.file_path ?? "";
  } catch {
    return;
  }
  if (!filePath || filePath.endsWith("USAGE.md")) return;
  if (!/src\/runtime\/(components|composables)\//.test(filePath)) return;

  const additionalContext =
    `Source file ${filePath} was just created or edited. ` +
    "Before ending this turn, dispatch the usage-auditor subagent " +
    "(Agent tool, subagent_type: usage-auditor) with this path to audit the " +
    "related USAGE.md for drift, then apply any reported fixes.";

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext,
      },
    }),
  );
});
