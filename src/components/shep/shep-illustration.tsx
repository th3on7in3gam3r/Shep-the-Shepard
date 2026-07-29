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
  /** Hero size — antenna bob and idle twitches */
  hero?: boolean;
  /** Play a short antenna-wag burst (maps former tail wag) */
  tailWagging?: boolean;
  /** Key to retrigger the wag animation */
  tailWagKey?: number;
  onTailWagEnd?: () => void;
  /** Mouse-follow gaze — head tilt + eye offset */
  gaze?: ShepGaze;
};

const HEAD_ORIGIN = "50px 34px";
const LEFT_EYE = { x: 43, y: 34 };
const RIGHT_EYE = { x: 57, y: 34 };

function Eye({
  baseX,
  baseY,
  offsetX,
  offsetY,
  heart,
}: {
  baseX: number;
  baseY: number;
  offsetX: number;
  offsetY: number;
  heart?: boolean;
}) {
  if (heart) {
    return (
      <g transform={`translate(${baseX + offsetX} ${baseY + offsetY})`}>
        <path
          d="M 0 -1.2 C -2.2 -3.4 -5.2 -1.2 -2.4 1.6 L 0 3.6 L 2.4 1.6 C 5.2 -1.2 2.2 -3.4 0 -1.2 Z"
          fill={D.antennaTip}
          transform="scale(0.55)"
        />
      </g>
    );
  }

  return (
    <g transform={`translate(${baseX + offsetX} ${baseY + offsetY})`}>
      {/* Capsule-style eye arcs */}
      <path
        d="M -4.5 -1.5 L -4.5 -3.2 Q -4.5 -5  -2.5 -5 L 2.5 -5 Q 4.5 -5 4.5 -3.2 L 4.5 -1.5"
        fill="none"
        stroke={D.eye}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M -4.5 1.5 L -4.5 3.2 Q -4.5 5  -2.5 5 L 2.5 5 Q 4.5 5 4.5 3.2 L 4.5 1.5"
        fill="none"
        stroke={D.eye}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </g>
  );
}

/** Standalone Shep SVG — robot avatar, hero, offline page. */
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
  const showHeart = mood === "happy";

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
      {/* Body chassis */}
      <ellipse
        cx="50"
        cy="68"
        rx="26"
        ry="22"
        fill={D.wool}
        stroke={D.outline}
        strokeWidth="1.6"
      />
      <ellipse cx="50" cy="58" rx="18" ry="6" fill={D.woolMid} opacity="0.55" />
      {/* Neck lip */}
      <ellipse
        cx="50"
        cy="50"
        rx="14"
        ry="4"
        fill={D.woolShadow}
        stroke={D.outlineSoft}
        strokeWidth="1"
      />

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
          {/* Antennae / ears */}
          <g
            className={cn(
              mood === "listening" && "animate-shep-ears-perk",
              mood === "thinking" && "animate-shep-ears-wiggle",
            )}
          >
            <g
              key={`ant-l-${tailWagKey}`}
              className={cn(
                idleEarTwitch && "animate-shep-ear-idle-left",
                tailWagging && "animate-shep-tail-wag",
              )}
              style={{ transformOrigin: "28px 32px" }}
              onAnimationEnd={tailWagging ? onTailWagEnd : undefined}
            >
              <circle cx="26" cy="34" r="5" fill={D.woolMid} stroke={D.outlineSoft} strokeWidth="1" />
              <line
                x1="26"
                y1="29"
                x2="24"
                y2="16"
                stroke={D.staffWood}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle
                cx="24"
                cy="14"
                r="2.2"
                fill={D.antennaTip}
                className={mood === "thinking" ? "animate-pulse" : undefined}
              />
            </g>
            <g className={cn(idleEarTwitch && "animate-shep-ear-idle-right")}>
              <circle cx="74" cy="34" r="5" fill={D.woolMid} stroke={D.outlineSoft} strokeWidth="1" />
              <line
                x1="74"
                y1="29"
                x2="76"
                y2="16"
                stroke={D.staffWood}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <circle cx="76" cy="14" r="2.2" fill={D.antennaTip} />
            </g>
          </g>

          {/* Dark dome head */}
          <circle cx="50" cy="34" r="18" fill={D.face} stroke={D.outline} strokeWidth="1.4" />

          {/* Cyan visor glow */}
          <ellipse
            cx="50"
            cy="34"
            rx="16"
            ry="15"
            fill="none"
            stroke={D.visor}
            strokeWidth="2.2"
            opacity={mood === "speaking" ? 0.95 : 0.55}
            className={mood === "speaking" ? "animate-pulse" : undefined}
          />

          {showBlush && (
            <>
              <ellipse cx="38" cy="40" rx="3.2" ry="1.8" fill={D.blush} opacity="0.35" />
              <ellipse cx="62" cy="40" rx="3.2" ry="1.8" fill={D.blush} opacity="0.35" />
            </>
          )}

          {/* Eyes */}
          <g className="animate-shep-blink">
            <Eye
              baseX={LEFT_EYE.x}
              baseY={LEFT_EYE.y}
              offsetX={eyeOffsetX}
              offsetY={eyeOffsetY}
              heart={showHeart}
            />
            <Eye
              baseX={RIGHT_EYE.x}
              baseY={RIGHT_EYE.y}
              offsetX={eyeOffsetX}
              offsetY={eyeOffsetY}
              heart={showHeart}
            />
          </g>

          {/* Visor “mouth” / speaking indicator */}
          {mood === "speaking" ? (
            <g className="animate-shep-mouth-open" style={{ transformOrigin: "50px 44px" }}>
              <rect
                x="44"
                y="42"
                width="12"
                height="5"
                rx="1.5"
                fill={D.visor}
                opacity="0.9"
              />
            </g>
          ) : (
            <rect
              x="46"
              y="43"
              width="8"
              height={mood === "happy" ? 3 : 2}
              rx="1"
              fill={D.visor}
              opacity="0.55"
            />
          )}
        </g>
      </g>

      {mood === "thinking" && (
        <text x="72" y="20" fontSize="9" fill={D.sage} opacity="0.75">
          …
        </text>
      )}
    </svg>
  );
}
