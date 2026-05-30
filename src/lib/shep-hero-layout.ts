/** Percentage layout for stacking hero PNG layers (tuned to shep-hero.png). */
export type ShepLayerBox = {
  top: string;
  left: string;
  width: string;
  height: string;
  /** CSS transform-origin for part animations */
  origin?: string;
};

export const SHEP_HERO_LAYER_LAYOUT = {
  body: {
    top: "9%",
    left: "50%",
    width: "94%",
    height: "88%",
    origin: "50% 70%",
  },
  tail: {
    top: "21%",
    left: "73%",
    width: "21%",
    height: "30%",
    origin: "12% 82%",
  },
  head: {
    top: "-1%",
    left: "50%",
    width: "90%",
    height: "58%",
    origin: "50% 68%",
  },
  earLeft: {
    top: "11%",
    left: "14%",
    width: "26%",
    height: "28%",
    origin: "72% 22%",
  },
  earRight: {
    top: "10%",
    left: "58%",
    width: "26%",
    height: "28%",
    origin: "28% 22%",
  },
} satisfies Record<string, ShepLayerBox>;
