"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ShepMood } from "@/components/shep-avatar";
import { ShepIllustration } from "@/components/shep/shep-illustration";
import { SCENE_GRADIENT } from "@/lib/shep-scene-gradient";
import { pickFloatingVerses } from "@/lib/shep-verse-bubbles";
import { cn } from "@/lib/utils";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { useShepGaze } from "@/hooks/use-shep-gaze";

type ShepSceneProps = {
  mood: ShepMood;
  /** @deprecated 2D Shep uses mood for mouth animation */
  isSpeaking?: boolean;
  /** Play welcome bounce when chat first opens */
  welcomeEntrance?: boolean;
  className?: string;
};

type VerseBubble = {
  id: number;
  text: string;
  left: string;
  delay: string;
  duration: string;
  drift: string;
};

function MeadowDecor() {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-4 top-6 h-8 w-16 rounded-full bg-white/50 animate-shep-cloud-drift"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-6 top-10 h-6 w-12 rounded-full bg-white/40 animate-shep-cloud-drift"
        style={{ animationDelay: "-4s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#c5d9bc]/60 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute bottom-2 left-[12%] flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1 rounded-full bg-shepherd-sage/35"
            style={{ height: `${10 + i * 4}px` }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-2 right-[18%] flex gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1 rounded-full bg-shepherd-sage/30"
            style={{ height: `${8 + i * 5}px` }}
          />
        ))}
      </div>
    </>
  );
}

function VerseBubbles({ bubbles }: { bubbles: VerseBubble[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="animate-shep-verse-float absolute bottom-[28%] max-w-[42%] truncate rounded-full border border-shepherd-sage/20 bg-white/55 px-2.5 py-0.5 text-[10px] font-medium italic text-shepherd-sage/80 backdrop-blur-sm"
          style={{
            left: b.left,
            animationDelay: b.delay,
            ["--duration" as string]: b.duration,
            ["--drift" as string]: b.drift,
          }}
        >
          {b.text}
        </span>
      ))}
    </div>
  );
}

function ShepSceneInner({
  mood,
  welcomeEntrance = false,
  className,
}: ShepSceneProps) {
  const [mounted, setMounted] = useState(false);
  const [tailWagging, setTailWagging] = useState(false);
  const [tailWagKey, setTailWagKey] = useState(0);
  const idleWagTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCoarsePointer = useCoarsePointer();
  const { containerRef, gaze, onPointerMove, onPointerLeave } = useShepGaze(!isCoarsePointer);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerTailWag = useCallback(() => {
    setTailWagKey((k) => k + 1);
    setTailWagging(true);
  }, []);

  const handleTailWagEnd = useCallback(() => {
    setTailWagging(false);
  }, []);

  useEffect(() => {
    if (!tailWagging) return;
    const safety = setTimeout(handleTailWagEnd, 900);
    return () => clearTimeout(safety);
  }, [tailWagging, handleTailWagEnd]);

  // Occasional idle tail wag — not constant
  useEffect(() => {
    if (!mounted || tailWagging) return;
    if (mood !== "idle" && mood !== "happy") return;

    const delay = 18_000 + Math.random() * 22_000;
    idleWagTimeoutRef.current = setTimeout(triggerTailWag, delay);

    return () => {
      if (idleWagTimeoutRef.current) clearTimeout(idleWagTimeoutRef.current);
    };
  }, [mounted, mood, tailWagging, triggerTailWag, tailWagKey]);

  const verseBubbles = useMemo((): VerseBubble[] => {
    if (!mounted) return [];
    return pickFloatingVerses(3).map((text, i) => ({
      id: i,
      text,
      left: `${14 + i * 26}%`,
      delay: `${i * 4.5}s`,
      duration: `${13 + i * 2}s`,
      drift: `${(i - 1) * 6}px`,
    }));
  }, [mounted]);

  const bodyAnim = cn(welcomeEntrance && "animate-shep-enter");

  return (
    <div
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        !isCoarsePointer && "cursor-default",
        className,
      )}
      style={{ background: SCENE_GRADIENT }}
    >
      <MeadowDecor />
      <VerseBubbles bubbles={verseBubbles} />

      <div
        className={cn(
          "relative z-10 w-[min(52%,11rem)] min-h-[8rem] sm:w-[min(48%,12rem)]",
          bodyAnim,
        )}
      >
        <button
          type="button"
          onClick={triggerTailWag}
          aria-label="Pet Shep"
          className={cn(
            "rounded-2xl p-2 transition-transform duration-300 active:scale-[0.98] sm:p-3",
            gaze.active && "scale-[1.01]",
          )}
        >
          <ShepIllustration
            mood={mood}
            hero
            tailWagging={tailWagging}
            tailWagKey={tailWagKey}
            onTailWagEnd={handleTailWagEnd}
            gaze={gaze}
            className="size-full drop-shadow-md"
          />
        </button>
      </div>
    </div>
  );
}

export const ShepScene = memo(ShepSceneInner);
