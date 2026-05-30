/** Gentle snippets that drift behind Shep in the chat meadow. */
export const SHEP_FLOATING_VERSES = [
  "The Lord is my shepherd",
  "Be still and know",
  "I am with you always",
  "Cast your cares on Him",
  "Peace I leave with you",
  "Do not be afraid",
  "His mercies are new",
  "Come to me, all who weary",
  "Love one another",
  "Trust in the Lord",
] as const;

export function pickFloatingVerses(count = 3): string[] {
  const pool = [...SHEP_FLOATING_VERSES];
  const picked: string[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]!);
  }
  return picked;
}
