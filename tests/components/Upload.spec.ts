import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

type DropHandler = (files: File[] | null) => void;

const dropHandlers: DropHandler[] = [];
const dialogHandlers: DropHandler[] = [];
const openDialogSpy = vi.fn();

vi.mock("@vueuse/core", () => ({
  useDropZone: (
    _target: unknown,
    options: { onDrop: DropHandler },
  ) => {
    dropHandlers.push(options.onDrop);
    return { isOverDropZone: ref(false) };
  },
  useFileDialog: () => ({
    open: openDialogSpy,
    onChange: (handler: DropHandler) => dialogHandlers.push(handler),
  }),
}));

const Upload = (await import("../../src/runtime/components/upload/index.vue"))
  .default;

function makeFile(name: string) {
  return new File(["content"], name, { type: "text/plain" });
}

function latestModel(wrapper: ReturnType<typeof mount>) {
  const events = wrapper.emitted("update:modelValue");
  return events?.[events.length - 1]?.[0] as File[] | undefined;
}

describe("Upload", () => {
  beforeEach(() => {
    dropHandlers.length = 0;
    dialogHandlers.length = 0;
    openDialogSpy.mockClear();
  });

  it("keeps a single selected file when maxFiles is unset", () => {
    const wrapper = mount(Upload, { props: { modelValue: [] } });

    dialogHandlers[0]!([makeFile("only.txt")]);

    const model = latestModel(wrapper);
    expect(model).toHaveLength(1);
    expect(model![0]!.name).toBe("only.txt");
  });

  it("keeps every dropped file when maxFiles is unset", () => {
    const wrapper = mount(Upload, { props: { modelValue: [] } });

    dropHandlers[0]!([makeFile("a.txt"), makeFile("b.txt")]);

    expect(latestModel(wrapper)?.map((file) => file.name)).toEqual([
      "a.txt",
      "b.txt",
    ]);
  });

  it("appends to the existing model value", () => {
    const existing = makeFile("existing.txt");
    const wrapper = mount(Upload, { props: { modelValue: [existing] } });

    dialogHandlers[0]!([makeFile("new.txt")]);

    expect(latestModel(wrapper)?.map((file) => file.name)).toEqual([
      "existing.txt",
      "new.txt",
    ]);
  });

  it("caps the model value at maxFiles", () => {
    const wrapper = mount(Upload, { props: { modelValue: [], maxFiles: 2 } });

    dropHandlers[0]!([makeFile("a.txt"), makeFile("b.txt"), makeFile("c.txt")]);

    expect(latestModel(wrapper)?.map((file) => file.name)).toEqual([
      "a.txt",
      "b.txt",
    ]);
  });

  it("ignores files while disabled", () => {
    const wrapper = mount(Upload, { props: { modelValue: [], disabled: true } });

    dropHandlers[0]!([makeFile("a.txt")]);

    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  });
});
