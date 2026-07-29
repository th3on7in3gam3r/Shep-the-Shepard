/**
 * Chat meadow hero: illustrated SVG (blinks, soft eyes, layered motion).
 * Set to `false` to use PNG artwork instead.
 */
export const SHEP_HERO_USE_ILLUSTRATED = true;

/** Hero Shep artwork — single composite PNG fallback. */
export const SHEP_HERO_IMAGE = "/shep/shep-hero.png";

/** Layered PNG parts for independent animation in chat. */
export const SHEP_HERO_LAYERS = {
  body: "/shep/layers/body.png",
  head: "/shep/layers/head.png",
  tail: "/shep/layers/tail.png",
  earLeft: "/shep/layers/ear-left.png",
  earRight: "/shep/layers/ear-right.png",
} as const;
