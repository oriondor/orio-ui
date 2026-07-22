export type MarkerVariant = "accent" | "success" | "alert" | "danger" | "muted";

export interface CalendarMarker {
  variant: MarkerVariant;
  start: string;
  end: string;
}

export interface ResolvedMarker {
  variant: MarkerVariant;
  isStart: boolean;
  isEnd: boolean;
}

const identity = (iso: string): string => iso;

/**
 * Build a resolver that maps an ISO key to the marker covering it.
 *
 * `getMarker` (if provided and non-null for the key) always wins. Otherwise the
 * LAST matching marker in `markers` wins — the list is reversed once up front so
 * later entries override earlier ones. `normalize` maps a marker bound (and the
 * queried key) into the comparison space: identity for the day calendar,
 * first-of-month for the month calendar.
 */
export function createMarkerResolver(
  markers: CalendarMarker[],
  getMarker: ((iso: string) => CalendarMarker | null) | undefined,
  normalize: (iso: string) => string | null = identity,
): (iso: string) => ResolvedMarker | null {
  const reversed = [...markers].reverse();

  return (iso: string): ResolvedMarker | null => {
    const matched =
      getMarker?.(iso) ??
      reversed.find((marker) => {
        const start = normalize(marker.start);
        const end = normalize(marker.end);
        return !!start && !!end && iso >= start && iso <= end;
      }) ??
      null;

    if (!matched) return null;

    return {
      variant: matched.variant,
      isStart: iso === normalize(matched.start),
      isEnd: iso === normalize(matched.end),
    };
  };
}
