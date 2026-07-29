/**
 * Extract the first Scripture-style reference from assistant text for "Save verse".
 * Matches forms like "Psalm 23:1", "John 3:16", "1 John 4:7", "Romans 8:28-30".
 */
const VERSE_REF_RE =
  /\b((?:[1-3]\s*)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song(?:\s+of\s+(?:Songs|Solomon))?|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation))\s+(\d{1,3}):(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?\b/i;

export type ExtractedVerse = {
  reference: string;
  /** Quoted snippet near the reference, if a quote is found. */
  text: string;
};

export function extractVerseFromText(text: string): ExtractedVerse | null {
  const match = text.match(VERSE_REF_RE);
  if (!match) return null;

  const book = match[1].replace(/\s+/g, " ").trim();
  const chapter = match[2];
  const verse = match[3];
  const end = match[4];
  const reference = end
    ? `${book} ${chapter}:${verse}-${end}`
    : `${book} ${chapter}:${verse}`;

  // Prefer a nearby quoted passage; else use a short window around the reference.
  const quoteMatch =
    text.match(/[""\u201C]([^""\u201C\u201D]{12,280})[""\u201D]/) ??
    text.match(/"([^"]{12,280})"/);
  const idx = match.index ?? 0;
  const window = text.slice(Math.max(0, idx - 20), idx + match[0].length + 160).trim();
  const textSnippet = (quoteMatch?.[1] ?? window).replace(/\s+/g, " ").trim();

  return {
    reference,
    text: textSnippet.slice(0, 280),
  };
}
