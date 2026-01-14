import { describe, it, expect, vi } from "vitest";
import { useModal } from "../../src/runtime/composables/useModal";

describe("useModal", () => {
  it("initializes with show=false and origin=null", () => {
    const { modalProps } = useModal();

    expect(modalProps.value.show).toBe(false);
    expect(modalProps.value.origin).toBe(null);
  });

  it("openModal without event sets show=true and origin=null", () => {
    const { modalProps, openModal } = useModal();

    openModal();

    expect(modalProps.value.show).toBe(true);
    expect(modalProps.value.origin).toBe(null);
  });

  it("openModal with event sets show=true and origin with element rect", () => {
    const { modalProps, openModal } = useModal();

    const mockEvent = {
      target: {
        getBoundingClientRect: () => ({
          left: 100,
          top: 200,
          width: 300,
          height: 400,
        }),
      },
    } as unknown as MouseEvent;

    openModal(mockEvent);

    expect(modalProps.value.show).toBe(true);
    expect(modalProps.value.origin).toEqual({
      x: 100,
      y: 200,
      width: 300,
      height: 400,
    });
  });

  it("onUpdate:show callback updates show state", () => {
    const { modalProps } = useModal();

    modalProps.value["onUpdate:show"](true);
    expect(modalProps.value.show).toBe(true);

    modalProps.value["onUpdate:show"](false);
    expect(modalProps.value.show).toBe(false);
  });
});
