import { cn } from "@/lib/utils";
import { SHEP_DESIGN as D } from "@/lib/shep-design";
import type { ShepMood } from "@/components/shep-avatar";
import type { ShepGaze } from "@/hooks/use-shep-gaze";
import { ShepHeroImage } from "@/components/shep/shep-hero-image";
import { SHEP_HERO_USE_ILLUSTRATED } from "@/lib/shep-assets";
import { useState } from "react";

type ShepIllustrationProps = {
  mood?: ShepMood;
  className?: string;
  /** Hero size — fluffy tail and idle ear twitches */
  hero?: boolean;
  /** Play a short tail-wag burst */
  tailWagging?: boolean;
  /** Key to retrigger the wag animation */
  tailWagKey?: number;
  onTailWagEnd?: () => void;
  /** Mouse-follow gaze — head tilt + eye offset */
  gaze?: ShepGaze;
};

const HEAD_ORIGIN = "50px 36px";
const LEFT_EYE = { x: 43, y: 34 };
const RIGHT_EYE = { x: 57, y: 34 };

function Eye({ baseX, baseY, offsetX, offsetY }: {
  baseX: number;
  baseY: number;
  offsetX: number;
  offsetY: number;
}) {
  return (
    <g transform={`translate(${baseX + offsetX} ${baseY + offsetY})`}>
      <circle cx="0" cy="0" r="2.8" fill={D.eye} />
      <circle cx="1" cy="-0.8" r="0.9" fill={D.eyeHighlight} />
    </g>
  );
}

/** Standalone Shep SVG — avatar, hero meadow, offline page. */
export function ShepIllustration({
  mood = "idle",
  className,
  hero = false,
  tailWagging = false,
  tailWagKey = 0,
  onTailWagEnd,
  gaze,
}: ShepIllustrationProps) {
  const showBlush =
    mood === "happy" ||
    mood === "thinking" ||
    mood === "listening" ||
    mood === "speaking";

  const idleEarTwitch = hero && mood === "idle";
  const gazeActive = gaze?.active ?? false;
  const gazeX = gaze?.x ?? 0;
  const gazeY = gaze?.y ?? 0;

  const headRotate = gazeX * 4;
  const headShiftX = gazeX * 0.8;
  const headShiftY = gazeY * 0.5;
  const eyeOffsetX = gazeX * 0.7;
  const eyeOffsetY = gazeY * 0.6;
  const hasGaze =
    gazeActive || Math.abs(gazeX) > 0.004 || Math.abs(gazeY) > 0.004;

  const [heroImageFailed, setHeroImageFailed] = useState(false);

  if (hero && !SHEP_HERO_USE_ILLUSTRATED && !heroImageFailed) {
    return (
      <ShepHeroImage
        mood={mood}
        className={className}
        gaze={gaze}
        tailWagging={tailWagging}
        tailWagKey={tailWagKey}
        onTailWagEnd={onTailWagEnd}
        onImageError={() => setHeroImageFailed(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("overflow-visible", className)}
      role="img"
      aria-label="Shep the Shepherd"
    >
      {/* Staff — behind body */}
      <g
        className={cn(mood === "thinking" && "animate-shep-staff-think")}
        style={{ transformOrigin: "74px 68px" }}
      >
        <path
          d="M 74 70 Q 82 56 80 44 Q 79 38 74 40"
          fill="none"
          stroke={D.staffStroke}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="74" cy="40" r="2.5" fill={D.staffGold} stroke={D.staffStroke} strokeWidth="0.8" />
      </g>

      {/* Fluffy tail — behind body, attached at the rear */}
      {hero && (
        <g
          key={tailWagKey}
          className={cn(tailWagging && "animate-shep-tail-wag")}
          style={{ transformOrigin: "30px 64px" }}
          onAnimationEnd={tailWagging ? onTailWagEnd : undefined}
        >
          <path
            d="M 30 60 C 24 61 20 66 19 72 C 18 77 21 80 25 79 C 28 78 30 74 31 69 C 32 65 31 62 30 60 Z"
            fill={D.woolShadow}
            stroke={D.outlineSoft}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <ellipse cx="23" cy="74" rx="4" ry="5" fill={D.woolMid} opacity="0.75" />
        </g>
      )}

      {/* Body — one silhouette with soft wool highlights, no inner strokes */}
      <ellipse cx="50" cy="60" rx="24" ry="22" fill={D.wool} stroke={D.outline} strokeWidth="1.6" />
      <ellipse cx="44" cy="52" rx="7" ry="5" fill={D.woolMid} opacity="0.5" />
      <ellipse cx="56" cy="52" rx="7" ry="5" fill={D.woolMid} opacity="0.5" />
      <ellipse cx="50" cy="48" rx="6" ry="4" fill={D.wool} opacity="0.65" />

      {/* Head group — gaze tilt wraps mood animations */}
      <g
        style={{
          transformOrigin: HEAD_ORIGIN,
          transform: hasGaze
            ? `translate(${headShiftX}px, ${headShiftY}px) rotate(${headRotate}deg)`
            : undefined,
        }}
      >
        <g
          className={cn(mood === "thinking" && "animate-shep-head-tilt")}
          style={{ transformOrigin: HEAD_ORIGIN }}
        >
        {/* Ears — behind head */}
        <g
          className={cn(
            mood === "listening" && "animate-shep-ears-perk",
            mood === "thinking" && "animate-shep-ears-wiggle",
          )}
        >
          <g className={cn(idleEarTwitch && "animate-shep-ear-idle-left")}>
            <ellipse
              cx="30"
              cy="36"
              rx="5"
              ry="3.2"
              fill={D.woolShadow}
              stroke={D.outlineSoft}
              strokeWidth="1"
            />
            <ellipse cx="29.5" cy="36" rx="2.5" ry="1.6" fill={D.innerEar} opacity="0.85" />
          </g>
          <g className={cn(idleEarTwitch && "animate-shep-ear-idle-right")}>
            <ellipse
              cx="70"
              cy="36"
              rx="5"
              ry="3.2"
              fill={D.woolShadow}
              stroke={D.outlineSoft}
              strokeWidth="1"
            />
            <ellipse cx="70.5" cy="36" rx="2.5" ry="1.6" fill={D.innerEar} opacity="0.85" />
          </g>
        </g>

        {/* Head */}
        <circle cx="50" cy="36" r="18" fill={D.wool} stroke={D.outline} strokeWidth="1.6" />

        {/* Face patch — sits inside head, no outline */}
        <ellipse cx="50" cy="40" rx="12" ry="10" fill={D.face} opacity="0.55" />

        {showBlush && (
          <>
            <ellipse cx="38" cy="40" rx="3.5" ry="2" fill={D.blush} opacity="0.3" />
            <ellipse cx="62" cy="40" rx="3.5" ry="2" fill={D.blush} opacity="0.3" />
          </>
        )}

        {/* Eyes */}
        <g className="animate-shep-blink">
          <Eye baseX={LEFT_EYE.x} baseY={LEFT_EYE.y} offsetX={eyeOffsetX} offsetY={eyeOffsetY} />
          <Eye baseX={RIGHT_EYE.x} baseY={RIGHT_EYE.y} offsetX={eyeOffsetX} offsetY={eyeOffsetY} />
          {(mood === "happy" || mood === "idle") && (
            <>
              <path
                d="M 40.5 31.5 Q 43 30 45.5 31.5"
                fill="none"
                stroke={D.sageDark}
                strokeWidth="0.7"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M 54.5 31.5 Q 57 30 59.5 31.5"
                fill="none"
                stroke={D.sageDark}
                strokeWidth="0.7"
                strokeLinecap="round"
                opacity="0.6"
              />
            </>
          )}
        </g>

        {/* Nose & mouth */}
        <ellipse cx="50" cy="41" rx="3.2" ry="2.4" fill={D.nose} />
        {mood === "speaking" ? (
          <g className="animate-shep-mouth-open" style={{ transformOrigin: "50px 45px" }}>
            <ellipse cx="50" cy="45" rx="5" ry="4" fill={D.mouth} />
            <ellipse cx="50" cy="45.5" rx="3.5" ry="2.8" fill={D.mouthInner} />
            <ellipse cx="50" cy="46.5" rx="2" ry="1.2" fill={D.tongue} opacity="0.85" />
          </g>
        ) : (
          <path
            d={
              mood === "happy"
                ? "M 45 44 Q 50 47.5 55 44"
                : "M 45 44.5 Q 50 47 55 44.5"
            }
            fill="none"
            stroke={D.mouth}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        )}
        </g>
      </g>

      {mood === "thinking" && (
        <text x="70" y="24" fontSize="9" fill={D.sage} opacity="0.65">
          …
        </text>
      )}
    </svg>
  );
}
