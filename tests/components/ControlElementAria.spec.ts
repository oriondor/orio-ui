import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import ControlElement from "../../src/runtime/components/ControlElement.vue";
import Button from "../../src/runtime/components/Button.vue";
import Icon from "../../src/runtime/components/Icon.vue";
import LoadingSpinner from "../../src/runtime/components/LoadingSpinner.vue";

/**
 * These assert on the *serialized* HTML, not on the live DOM. ARIA reflection
 * (`'ariaLabel' in el`) makes camelCase bag keys look like they work in a
 * browser assertion while the SSR markup carries `arialabel` instead — so a
 * mount-based test cannot catch the regression this file exists for.
 */
function renderSSR(render: () => ReturnType<typeof h>) {
  const app = createSSRApp({ render });
  app.component("OrioControlElement", ControlElement);
  app.component("OrioIcon", Icon);
  app.component("OrioLoadingSpinner", LoadingSpinner);
  return renderToString(app);
}

function renderControl(props: Record<string, unknown>) {
  return renderSSR(() =>
    h(ControlElement, props, {
      default: ({ control }: { control: Record<string, unknown> }) =>
        h("input", control),
    }),
  );
}

describe("ControlElement control bag (serialized attrs)", () => {
  it("emits aria-label, never arialabel", async () => {
    const html = await renderControl({ ariaLabel: "Close dialog" });

    expect(html).toContain('aria-label="Close dialog"');
    expect(html).not.toContain("arialabel");
  });

  it("points aria-describedby at the rendered error span", async () => {
    const html = await renderControl({
      id: "email",
      error: "Enter a valid email address.",
    });

    expect(html).toContain('aria-describedby="email-error"');
    expect(html).toContain('id="email-error"');
    expect(html).not.toContain("ariadescribedby");
  });

  it("emits aria-invalid on error and aria-required when required", async () => {
    const html = await renderControl({ error: "Required.", required: true });

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("aria-required");
    expect(html).not.toContain("ariainvalid");
    expect(html).not.toContain("ariarequired");
  });

  it("omits the aria attrs entirely when there is nothing to say", async () => {
    const html = await renderControl({});

    expect(html).not.toContain("aria-label");
    expect(html).not.toContain("aria-describedby");
    expect(html).not.toContain("aria-invalid");
    expect(html).not.toContain("aria-required");
  });

  it("emits focus-key, the attr useRovingGrid queries", async () => {
    const html = await renderControl({ focusKey: "2026-09-22" });

    expect(html).toContain('focus-key="2026-09-22"');
    expect(html).not.toContain("focuskey=");
  });

  it("names an icon-only Button through the ariaLabel prop", async () => {
    const html = await renderSSR(() =>
      h(Button, { ariaLabel: "Close", icon: "close" }),
    );

    expect(html).toContain('aria-label="Close"');
    expect(html).not.toContain("arialabel");
  });
});
