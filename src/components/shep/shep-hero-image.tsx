"use client";

import type { CSSProperties } from "react";
import { useCallback, useState } from "react";
import type { ShepMood } from "@/components/shep-avatar";
import type { ShepGaze } from "@/hooks/use-shep-gaze";
import { SHEP_HERO_IMAGE } from "@/lib/shep-assets";
import { cn } from "@/lib/utils";

type ShepHeroImageProps = {
  mood?: ShepMood;
  className?: string;
  gaze?: ShepGaze;
  tailWagging?: boolean;
  tailWagKey?: number;
  onTailWagEnd?: () => void;
  onImageError?: () => void;
};

/** Single PNG hero — gentle whole-body motion only (no layered parts). */
export function ShepHeroImage({
  mood = "idle",
  className,
  gaze,
  tailWagging = false,
  tailWagKey = 0,
  onTailWagEnd,
  onImageError,
}: ShepHeroImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
    onImageError?.();
  }, [onImageError]);

  const gazeX = gaze?.x ?? 0;
  const gazeY = gaze?.y ?? 0;
  const hasGaze =
    (gaze?.active ?? false) || Math.abs(gazeX) > 0.004 || Math.abs(gazeY) > 0.004;

  const bodyAnim = cn(
    (mood === "idle" || mood === "happy") && "animate-shep-hero-idle-bob",
    mood === "speaking" && "animate-shep-speak",
    mood === "listening" && "animate-shep-listen",
  );

  if (imageError) return null;

  const gazeStyle: CSSProperties | undefined = hasGaze
    ? {
        transform: `translate(${gazeX * 2}px, ${gazeY * 1.5}px) rotate(${gazeX * 1.5}deg)`,
      }
    : undefined;

  return (
    <div
      className={cn("relative aspect-square w-full min-h-[8rem]", className)}
      role="img"
      aria-label="Shep the Shepherd"
    >
      <div className={cn("relative size-full", bodyAnim)} style={gazeStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={tailWagKey}
          src={SHEP_HERO_IMAGE}
          alt=""
          aria-hidden
          decoding="async"
          draggable={false}
          className={cn(
            "size-full object-contain object-center drop-shadow-[0_6px_14px_rgba(74,100,68,0.18)]",
            "brightness-[1.03] saturate-[0.94] contrast-[0.96]",
            tailWagging && "animate-shep-hero-wag",
          )}
          style={{ transformOrigin: "50% 88%" }}
          onAnimationEnd={tailWagging ? onTailWagEnd : undefined}
          onError={handleImageError}
        />
      </div>
    </div>
  );
}
