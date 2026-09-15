import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createApp, nextTick, render, type Component } from "vue";
import { config } from "@vue/test-utils";
import { mountToastHost } from "../../src/runtime/components/Toast/mount";
import { useToast } from "../../src/runtime/composables/useToast";
import { i18n } from "../../src/runtime/i18n";

function createAppContext() {
  const app = createApp({ render: () => null });
  app.use(i18n);

  // Nuxt registers the library globally; mirror that for the bare app.
  Object.entries(config.global.components as Record<string, Component>).forEach(
    ([name, component]) => app.component(name, component),
  );

  return app._context;
}

let container: HTMLElement | null = null;

describe("mountToastHost", () => {
  beforeEach(() => {
    useToast().clearToasts();
  });

  afterEach(() => {
    useToast().clearToasts();
    if (container) render(null, container);
    container?.remove();
    container = null;
    document.body.innerHTML = "";
  });

  it("appends its own container to the body", () => {
    container = mountToastHost(createAppContext());

    expect(container.parentElement).toBe(document.body);
  });

  it("renders queued toasts once the host is mounted", async () => {
    container = mountToastHost(createAppContext());

    useToast().showToast({ message: "Saved", timeout: 0 });
    await nextTick();

    expect(document.body.textContent).toContain("Saved");
  });

  it("reuses the container when called twice", () => {
    container = mountToastHost(createAppContext());
    const second = mountToastHost(createAppContext());

    expect(second).toBe(container);
    expect(document.querySelectorAll("#orio-toast-host")).toHaveLength(1);
  });

  it("inherits the app context so i18n resolves inside toasts", async () => {
    container = mountToastHost(createAppContext());

    useToast().showToast({ message: "Saved", timeout: 0 });
    await nextTick();

    const closeButton = document.querySelector(".toast-close button");
    expect(closeButton?.getAttribute("aria-label")).toBe("Close notification");
  });
});
