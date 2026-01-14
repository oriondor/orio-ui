import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useFuzzySearch } from "../../src/runtime/composables/useFuzzySearch";

describe("useFuzzySearch", () => {
  it("searches string array with exact match", () => {
    const data = ["apple", "banana", "cherry"];
    const search = ref("banana");

    const results = useFuzzySearch(data, search);

    expect(results.value).toContain("banana");
  });

  it("searches string array with fuzzy match", () => {
    const data = ["apple", "banana", "cherry"];
    const search = ref("bana");

    const results = useFuzzySearch(data, search);

    expect(results.value).toContain("banana");
  });

  it("returns all items when search is empty", () => {
    const data = ["apple", "banana", "cherry"];
    const search = ref("");

    const results = useFuzzySearch(data, search);

    expect(results.value).toHaveLength(3);
    expect(results.value).toEqual(["apple", "banana", "cherry"]);
  });

  it("searches object array with keys option", () => {
    const data = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
      { id: 3, name: "Bob Johnson" },
    ];
    const search = ref("Jane");

    const results = useFuzzySearch(data, search, { keys: ["name"] });

    expect(results.value).toHaveLength(1);
    expect(results.value[0]).toEqual({ id: 2, name: "Jane Smith" });
  });

  it("updates results reactively when search changes", () => {
    const data = ["apple", "banana", "cherry"];
    const search = ref("apple");

    const results = useFuzzySearch(data, search);

    expect(results.value).toContain("apple");
    expect(results.value).not.toContain("banana");

    search.value = "banana";

    expect(results.value).toContain("banana");
  });

  it("returns empty array when no matches found", () => {
    const data = ["apple", "banana", "cherry"];
    const search = ref("xyz");

    const results = useFuzzySearch(data, search);

    expect(results.value).toHaveLength(0);
  });
});
