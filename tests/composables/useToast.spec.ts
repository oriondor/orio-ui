import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useToast } from "../../src/runtime/composables/useToast";

const BASE_DEFAULTS = {
  variant: "info",
  position: "bottom-end",
  timeout: 5000,
  closable: true,
  showTimeout: false,
  limit: 5,
} as const;

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useToast().clearToasts();
    useToast().setToastDefaults({ ...BASE_DEFAULTS });
  });

  afterEach(() => {
    useToast().clearToasts();
    vi.useRealTimers();
  });

  it("adds a toast carrying the default options", () => {
    const { toasts, showToast } = useToast();

    const id = showToast({ message: "Saved" });

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0]).toMatchObject({
      id,
      message: "Saved",
      variant: "info",
      position: "bottom-end",
      timeout: 5000,
      closable: true,
      showTimeout: false,
    });
  });

  it("lets each toast override the defaults", () => {
    const { toasts, showToast } = useToast();

    showToast({
      message: "Upload failed",
      title: "Error",
      variant: "danger",
      position: "top-center",
      timeout: 0,
      closable: false,
      showTimeout: true,
    });

    expect(toasts.value[0]).toMatchObject({
      message: "Upload failed",
      title: "Error",
      variant: "danger",
      position: "top-center",
      timeout: 0,
      closable: false,
      showTimeout: true,
    });
  });

  it("removes a toast by id", () => {
    const { toasts, showToast, closeToast } = useToast();

    const first = showToast({ message: "First" });
    const second = showToast({ message: "Second" });

    closeToast(first);

    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].id).toBe(second);
  });

  it("clears every toast at once", () => {
    const { toasts, showToast, clearToasts } = useToast();

    showToast({ message: "First" });
    showToast({ message: "Second" });
    clearToasts();

    expect(toasts.value).toHaveLength(0);
  });

  it("dismisses a toast once its timeout elapses", () => {
    const { toasts, showToast } = useToast();

    showToast({ message: "Saved", timeout: 3000 });

    vi.advanceTimersByTime(2999);
    expect(toasts.value).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(toasts.value).toHaveLength(0);
  });

  it("keeps a toast with timeout 0 until it is closed", () => {
    const { toasts, showToast } = useToast();

    showToast({ message: "Sticky", timeout: 0 });
    vi.advanceTimersByTime(60000);

    expect(toasts.value).toHaveLength(1);
  });

  it("holds the countdown while paused and finishes the rest on resume", () => {
    const { toasts, showToast, pauseToast, resumeToast } = useToast();

    const id = showToast({ message: "Saved", timeout: 3000 });

    vi.advanceTimersByTime(1000);
    pauseToast(id);
    vi.advanceTimersByTime(60000);
    expect(toasts.value).toHaveLength(1);

    resumeToast(id);
    vi.advanceTimersByTime(1999);
    expect(toasts.value).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(toasts.value).toHaveLength(0);
  });

  it("drops the oldest toast of a stack once the limit is reached", () => {
    const { toasts, showToast, setToastDefaults } = useToast();

    setToastDefaults({ limit: 2 });
    const first = showToast({ message: "First", timeout: 0 });
    showToast({ message: "Second", timeout: 0 });
    showToast({ message: "Third", timeout: 0 });

    expect(toasts.value).toHaveLength(2);
    expect(toasts.value.find((toast) => toast.id === first)).toBeUndefined();
    expect(toasts.value.map((toast) => toast.message)).toEqual([
      "Second",
      "Third",
    ]);
  });

  it("counts the limit per stack, not across positions", () => {
    const { toasts, showToast, setToastDefaults } = useToast();

    setToastDefaults({ limit: 1 });
    showToast({ message: "Bottom", timeout: 0, position: "bottom-end" });
    showToast({ message: "Top", timeout: 0, position: "top-center" });

    expect(toasts.value).toHaveLength(2);
  });

  it("counts the limit per target element", () => {
    const { toasts, showToast, setToastDefaults } = useToast();
    const panel = document.createElement("div");

    setToastDefaults({ limit: 1 });
    showToast({ message: "Body", timeout: 0 });
    showToast({ message: "Panel", timeout: 0, target: panel });

    expect(toasts.value).toHaveLength(2);
  });

  it("closes the toast after an action handler resolves", async () => {
    const { toasts, showToast, triggerAction } = useToast();
    const restore = vi.fn();

    showToast({
      message: "File deleted",
      timeout: 0,
      actions: [{ label: "Undo", onClick: restore }],
    });

    await triggerAction(toasts.value[0], toasts.value[0].actions[0]);

    expect(restore).toHaveBeenCalledOnce();
    expect(toasts.value).toHaveLength(0);
  });

  it("keeps the toast open while an async action is pending", async () => {
    const { toasts, showToast, triggerAction } = useToast();
    let resolveAction: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      resolveAction = resolve;
    });

    showToast({
      message: "File deleted",
      timeout: 0,
      actions: [{ label: "Undo", onClick: () => pending }],
    });

    const running = triggerAction(toasts.value[0], toasts.value[0].actions[0]);
    await Promise.resolve();
    expect(toasts.value).toHaveLength(1);

    resolveAction();
    await running;
    expect(toasts.value).toHaveLength(0);
  });

  it("leaves a keepOpen action's toast in place", async () => {
    const { toasts, showToast, triggerAction } = useToast();

    showToast({
      message: "File deleted",
      timeout: 0,
      actions: [{ label: "Details", keepOpen: true, onClick: () => {} }],
    });

    await triggerAction(toasts.value[0], toasts.value[0].actions[0]);

    expect(toasts.value).toHaveLength(1);
  });

  it("hands the action handler a close callback and its own toast", async () => {
    const { toasts, showToast, triggerAction } = useToast();
    const received: string[] = [];

    const id = showToast({
      message: "File deleted",
      timeout: 0,
      actions: [
        {
          label: "Details",
          keepOpen: true,
          onClick: ({ close, toast }) => {
            received.push(toast.id);
            close();
          },
        },
      ],
    });

    await triggerAction(toasts.value[0], toasts.value[0].actions[0]);

    expect(received).toEqual([id]);
    expect(toasts.value).toHaveLength(0);
  });

  it("turns the countdown bar on for every later toast", () => {
    const { toasts, showToast, setToastDefaults } = useToast();

    setToastDefaults({ showTimeout: true });
    showToast({ message: "Saved" });

    expect(toasts.value[0].showTimeout).toBe(true);
  });

  it("applies changed defaults to later toasts only", () => {
    const { toasts, showToast, setToastDefaults } = useToast();

    showToast({ message: "Before", timeout: 0 });
    setToastDefaults({ variant: "success", position: "top-end" });
    showToast({ message: "After", timeout: 0 });

    expect(toasts.value[0]).toMatchObject({
      variant: "info",
      position: "bottom-end",
    });
    expect(toasts.value[1]).toMatchObject({
      variant: "success",
      position: "top-end",
    });
  });

  it("shares one queue across every call site", () => {
    const publisher = useToast();
    const reader = useToast();

    publisher.showToast({ message: "Saved", timeout: 0 });

    expect(reader.toasts.value).toHaveLength(1);
  });
});
