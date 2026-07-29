"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ShepGaze = {
  /** Horizontal look direction, -1 (left) to 1 (right) */
  x: number;
  /** Vertical look direction, -1 (up) to 1 (down) */
  y: number;
  /** Pointer is over the tracking area */
  active: boolean;
};

const IDLE_GAZE: ShepGaze = { x: 0, y: 0, active: false };

export function useShepGaze(enabled = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gaze, setGaze] = useState<ShepGaze>(IDLE_GAZE);
  const targetRef = useRef<ShepGaze>(IDLE_GAZE);
  const frameRef = useRef(0);

  const updateTarget = useCallback(
    (clientX: number, clientY: number, active: boolean) => {
      const el = containerRef.current;
      if (!el || !enabled) {
        targetRef.current = IDLE_GAZE;
        return;
      }

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (clientX - cx) / (rect.width * 0.45)));
      const ny = Math.max(-1, Math.min(1, (clientY - cy) / (rect.height * 0.45)));

      targetRef.current = { x: nx, y: ny, active };
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) {
      setGaze(IDLE_GAZE);
      return;
    }

    const tick = () => {
      const target = targetRef.current;
      setGaze((prev) => {
        const ease = target.active ? 0.2 : 0.12;
        const x = prev.x + (target.x - prev.x) * ease;
        const y = prev.y + (target.y - prev.y) * ease;

        if (!target.active && Math.abs(x) < 0.004 && Math.abs(y) < 0.004) {
          return IDLE_GAZE;
        }

        return { x, y, active: target.active };
      });
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [enabled]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === "touch") return;
      updateTarget(event.clientX, event.clientY, true);
    },
    [updateTarget],
  );

  const onPointerLeave = useCallback(() => {
    targetRef.current = IDLE_GAZE;
  }, []);

  return { containerRef, gaze, onPointerMove, onPointerLeave };
}
