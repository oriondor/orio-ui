export interface UseInertiaOptions {
  friction?: number;
  minVelocity?: number;
}

export function useInertia(
  onTick: (dx: number, dy: number) => void,
  options: UseInertiaOptions = {},
) {
  const { friction = 0.92, minVelocity = 0.5 } = options;

  let vx = 0;
  let vy = 0;
  let frameId: number | null = null;
  let lastMoveTime = 0;

  function tick() {
    vx *= friction;
    vy *= friction;
    if (Math.abs(vx) < minVelocity && Math.abs(vy) < minVelocity) {
      frameId = null;
      return;
    }
    onTick(vx, vy);
    frameId = requestAnimationFrame(tick);
  }

  function stop() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    vx = 0;
    vy = 0;
  }

  function trackMove(dx: number, dy: number) {
    const now = performance.now();
    const dt = now - lastMoveTime;
    lastMoveTime = now;

    if (dt > 0 && dt < 100) {
      const factor = 16 / dt;
      vx = dx * factor;
      vy = dy * factor;
    } else {
      vx = 0;
      vy = 0;
    }
  }

  function resetTime() {
    lastMoveTime = performance.now();
  }

  function release() {
    if (performance.now() - lastMoveTime < 50) {
      if (Math.abs(vx) >= minVelocity || Math.abs(vy) >= minVelocity) {
        frameId = requestAnimationFrame(tick);
      }
    }
  }

  return { stop, trackMove, resetTime, release };
}
