import { describe, it, expect } from "vitest";
import {
  createMarkerResolver,
  type CalendarMarker,
} from "../../src/runtime/utils/calendar-markers";

const startOfMonth = (iso: string): string => `${iso.slice(0, 7)}-01`;

describe("createMarkerResolver", () => {
  it("returns null when no marker covers the date", () => {
    const resolve = createMarkerResolver([], undefined);
    expect(resolve("2024-06-15")).toBeNull();
  });

  it("resolves a range marker with correct start/end flags (identity normalize)", () => {
    const markers: CalendarMarker[] = [
      { variant: "accent", start: "2024-06-10", end: "2024-06-12" },
    ];
    const resolve = createMarkerResolver(markers, undefined);
    expect(resolve("2024-06-09")).toBeNull();
    expect(resolve("2024-06-10")).toEqual({
      variant: "accent",
      isStart: true,
      isEnd: false,
    });
    expect(resolve("2024-06-11")).toEqual({
      variant: "accent",
      isStart: false,
      isEnd: false,
    });
    expect(resolve("2024-06-12")).toEqual({
      variant: "accent",
      isStart: false,
      isEnd: true,
    });
  });

  it("last overlapping marker wins", () => {
    const markers: CalendarMarker[] = [
      { variant: "accent", start: "2024-06-01", end: "2024-06-30" },
      { variant: "danger", start: "2024-06-15", end: "2024-06-15" },
    ];
    const resolve = createMarkerResolver(markers, undefined);
    expect(resolve("2024-06-15")?.variant).toBe("danger");
    expect(resolve("2024-06-14")?.variant).toBe("accent");
  });

  it("getMarker override takes precedence over the markers list", () => {
    const markers: CalendarMarker[] = [
      { variant: "accent", start: "2024-06-10", end: "2024-06-12" },
    ];
    const getMarker = (iso: string): CalendarMarker | null =>
      iso === "2024-06-11"
        ? { variant: "success", start: "2024-06-11", end: "2024-06-11" }
        : null;
    const resolve = createMarkerResolver(markers, getMarker);
    expect(resolve("2024-06-11")).toEqual({
      variant: "success",
      isStart: true,
      isEnd: true,
    });
    // falls back to the list where getMarker returns null
    expect(resolve("2024-06-10")?.variant).toBe("accent");
  });

  it("normalize maps bounds into a comparison space (month pinning)", () => {
    const markers: CalendarMarker[] = [
      { variant: "alert", start: "2024-03-20", end: "2024-05-04" },
    ];
    const resolve = createMarkerResolver(markers, undefined, startOfMonth);
    expect(resolve("2024-02-01")).toBeNull();
    expect(resolve("2024-03-01")).toEqual({
      variant: "alert",
      isStart: true,
      isEnd: false,
    });
    expect(resolve("2024-04-01")).toEqual({
      variant: "alert",
      isStart: false,
      isEnd: false,
    });
    expect(resolve("2024-05-01")).toEqual({
      variant: "alert",
      isStart: false,
      isEnd: true,
    });
  });
});
