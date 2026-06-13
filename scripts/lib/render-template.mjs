/**
 * Minimal template renderer for the agent body templates in
 * `scripts/templates/bodies/`.
 *
 * Syntax:
 *   {{#repo}} / {{/repo}}          line-level block kept only for variant "repo"
 *   {{#consumer}} / {{/consumer}}  line-level block kept only for variant "consumer"
 *   {{variableName}}               substituted from `vars`; unresolved names throw
 *
 * Block markers must sit alone on their own line; the marker lines are removed
 * from the output.
 */
const VARIANTS = ["repo", "consumer"];

export function renderTemplate(template, { variant, vars }) {
  if (!VARIANTS.includes(variant)) {
    throw new Error(`unknown variant "${variant}"`);
  }

  let output = template;
  VARIANTS.forEach((blockVariant) => {
    const block = new RegExp(
      `^\\{\\{#${blockVariant}\\}\\}\\r?\\n([\\s\\S]*?)^\\{\\{/${blockVariant}\\}\\}\\r?\\n?`,
      "gm",
    );
    output = output.replace(block, (match, body) =>
      blockVariant === variant ? body : "",
    );
  });

  output = output.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    if (vars[name] === undefined) {
      throw new Error(`unresolved template variable "${name}"`);
    }
    return vars[name];
  });

  return output;
}
