/** Shep's signature bleat — playful variants for greetings and delight. */
export const SHEP_BAA_VARIANTS = [
  "Baa!",
  "Baaaa!",
  "Baaaaa!",
  "Baaaaaa!",
  "Baa…",
  "Baaaaaa…",
] as const;

export type ShepBaa = (typeof SHEP_BAA_VARIANTS)[number];

/** Pick a baa — optional seed keeps the choice stable for a session. */
export function pickShepBaa(seed?: number): ShepBaa {
  if (seed != null) {
    return SHEP_BAA_VARIANTS[Math.abs(seed) % SHEP_BAA_VARIANTS.length];
  }
  return SHEP_BAA_VARIANTS[Math.floor(Math.random() * SHEP_BAA_VARIANTS.length)];
}

/** Prefix a line with one of Shep's baas. */
export function withShepBaa(message: string, seed?: number): string {
  return `${pickShepBaa(seed)} ${message}`;
}
