import { describe, it, expect } from "vitest";
import { getFocusable } from "../../src/runtime/utils/focusable";

describe("getFocusable", () => {
  it("returns the first summary of a details, not later ones", () => {
    const root = document.createElement("div");
    root.innerHTML =
      "<details><summary id='a'>A</summary><summary id='b'>B</summary></details><button id='c'>C</button>";
    expect(getFocusable(root).map((element) => element.id)).toEqual(["a", "c"]);
  });

  it("skips a first summary with tabindex=-1", () => {
    const root = document.createElement("div");
    root.innerHTML =
      "<details><summary id='a' tabindex='-1'>A</summary></details><button id='c'>C</button>";
    expect(getFocusable(root).map((element) => element.id)).toEqual(["c"]);
  });
});
