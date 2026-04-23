export interface PinchCallbacks {
  onPinchStart?: () => void;
  onPinchMove?: (
    scaleFactor: number,
    midX: number,
    midY: number,
    dx: number,
    dy: number,
  ) => void;
  onSingleDown?: (e: PointerEvent) => void;
  onSingleUp?: (remainingId: number, x: number, y: number) => void;
  onAllUp?: () => void;
}

export function usePinchZoom(callbacks: PinchCallbacks) {
  const pointers = new Map<number, { x: number; y: number }>();

  let startDist = 0;
  let lastMid = { x: 0, y: 0 };

  function distance() {
    const pts = [...pointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  }

  function midpoint() {
    const pts = [...pointers.values()];
    if (pts.length < 2) return { x: 0, y: 0 };
    return {
      x: (pts[0].x + pts[1].x) / 2,
      y: (pts[0].y + pts[1].y) / 2,
    };
  }

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType !== "touch") return false;

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (pointers.size === 2) {
      startDist = distance();
      lastMid = midpoint();
      callbacks.onPinchStart?.();
      return true;
    }

    if (pointers.size === 1) {
      callbacks.onSingleDown?.(e);
      return true;
    }

    return true;
  }

  function onPointerMove(e: PointerEvent) {
    if (!pointers.has(e.pointerId)) return false;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const dist = distance();
      const mid = midpoint();
      const scaleFactor = startDist > 0 ? dist / startDist : 1;
      const dx = mid.x - lastMid.x;
      const dy = mid.y - lastMid.y;
      lastMid = mid;
      callbacks.onPinchMove?.(scaleFactor, mid.x, mid.y, dx, dy);
      return true;
    }

    return false;
  }

  function onPointerUp(e: PointerEvent) {
    if (!pointers.has(e.pointerId)) return false;
    pointers.delete(e.pointerId);

    if (pointers.size === 1) {
      const [id, pt] = [...pointers.entries()][0];
      startDist = 0;
      callbacks.onSingleUp?.(id, pt.x, pt.y);
      return true;
    }

    if (pointers.size === 0) {
      startDist = 0;
      callbacks.onAllUp?.();
    }

    return false;
  }

  return { onPointerDown, onPointerMove, onPointerUp, pointers };
}
