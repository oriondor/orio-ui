import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { usePressAndHold } from "../../src/runtime/composables/usePressAndHold";

describe("usePressAndHold", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls callback immediately", () => {
    const { pressAndHold } = usePressAndHold();
    const callback = vi.fn();

    pressAndHold(callback);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("starts interval after 500ms delay", () => {
    const { pressAndHold } = usePressAndHold();
    const callback = vi.fn();

    pressAndHold(callback);

    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(500);
    vi.advanceTimersByTime(50);

    expect(callback).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(50);

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("stops interval and timeout when stop is called", () => {
    const { pressAndHold, stop } = usePressAndHold();
    const callback = vi.fn();

    pressAndHold(callback);

    vi.advanceTimersByTime(500);
    vi.advanceTimersByTime(100);

    const countBeforeStop = callback.mock.calls.length;

    stop();

    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledTimes(countBeforeStop);
  });

  it("stops before interval starts if stop called during delay", () => {
    const { pressAndHold, stop } = usePressAndHold();
    const callback = vi.fn();

    pressAndHold(callback);

    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200);

    stop();

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
