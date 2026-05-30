"use client";

import { cn } from "@/lib/utils";
import { ShepIllustration } from "@/components/shep/shep-illustration";

export type ShepMood = "idle" | "thinking" | "speaking" | "listening" | "happy";

/** @deprecated */
export type LennyMood = ShepMood;

type ShepAvatarProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  mood?: ShepMood;
  /** Brief happy bounce on mount (e.g. opening chat) */
  entrance?: boolean;
  /** @deprecated use mood instead */
  animated?: boolean;
};

const sizes = {
  sm: "size-10",
  md: "size-14",
  lg: "size-20",
  xl: "size-28",
};

export function ShepAvatar({
  size = "md",
  className,
  mood = "idle",
  entrance = false,
  animated,
}: ShepAvatarProps) {
  const effectiveMood = animated && mood === "idle" ? "idle" : mood;

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full bg-shepherd-meadow/30 p-1 ring-2 ring-shepherd-sage/40",
        sizes[size],
        effectiveMood === "idle" && "animate-gentle-bounce",
        effectiveMood === "happy" && "animate-shep-happy",
        entrance && "animate-shep-enter",
        effectiveMood === "thinking" && "animate-shep-think",
        effectiveMood === "speaking" && "animate-shep-speak",
        effectiveMood === "listening" && "animate-shep-listen",
        className,
      )}
      aria-hidden
    >
      <ShepIllustration mood={effectiveMood} className="size-full" />

      {effectiveMood === "listening" && (
        <span className="absolute -right-0.5 -top-0.5 flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-shepherd-sage opacity-60" />
          <span className="relative inline-flex size-3 rounded-full bg-shepherd-sage" />
        </span>
      )}
    </div>
  );
}

/** @deprecated Use ShepAvatar */
export const LennyAvatar = ShepAvatar;
