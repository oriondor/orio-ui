import { describe, it, expect } from "vitest";
// @ts-ignore — plain .mjs module without type declarations
import { renderTemplate } from "../../scripts/lib/render-template.mjs";

describe("renderTemplate", () => {
  it("substitutes {{variable}} placeholders", () => {
    const output = renderTemplate("read {{componentsRoot}}Modal.vue", {
      variant: "repo",
      vars: { componentsRoot: "src/runtime/components/" },
    });
    expect(output).toBe("read src/runtime/components/Modal.vue");
  });

  it("keeps the active variant block content and drops its markers", () => {
    const template = [
      "shared line",
      "{{#repo}}",
      "repo-only line",
      "{{/repo}}",
      "tail line",
    ].join("\n");

    const output = renderTemplate(template, { variant: "repo", vars: {} });

    expect(output).toBe("shared line\nrepo-only line\ntail line");
  });

  it("matches block markers across CRLF line endings", () => {
    const template = [
      "shared line",
      "{{#repo}}",
      "repo-only line",
      "{{/repo}}",
      "tail line",
    ].join("\r\n");

    const output = renderTemplate(template, { variant: "repo", vars: {} });

    expect(output).toBe("shared line\r\nrepo-only line\r\ntail line");
  });

  it("removes inactive variant blocks entirely", () => {
    const template = [
      "shared line",
      "{{#consumer}}",
      "consumer-only line",
      "{{/consumer}}",
      "tail line",
    ].join("\n");

    const output = renderTemplate(template, { variant: "repo", vars: {} });

    expect(output).toBe("shared line\ntail line");
  });

  it("handles multiple blocks and variables together", () => {
    const template = [
      "{{#repo}}",
      "model: opus",
      "{{/repo}}",
      "{{#consumer}}",
      "consumer note",
      "{{/consumer}}",
      "root: {{root}}",
    ].join("\n");

    const output = renderTemplate(template, {
      variant: "consumer",
      vars: { root: "node_modules/orio-ui/" },
    });

    expect(output).toBe("consumer note\nroot: node_modules/orio-ui/");
  });

  it("throws on unknown {{variable}} left unresolved", () => {
    expect(() =>
      renderTemplate("path {{missingVar}}", { variant: "repo", vars: {} }),
    ).toThrow(/missingVar/);
  });
});
