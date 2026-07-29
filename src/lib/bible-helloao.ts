/** helloao.org Free Use Bible API — https://bible.helloao.org */

export const HELLOAO_API = "https://bible.helloao.org/api";
export const HELLOAO_COMMENTARY_API = `${HELLOAO_API}/c`;

export const DEFAULT_TRANSLATION = "BSB";

/** Popular English translations on helloao */
export const FEATURED_TRANSLATIONS = [
  { id: "BSB", name: "Berean Standard Bible" },
  { id: "ENGWEBP", name: "World English Bible" },
  { id: "eng_kjv", name: "King James Version" },
  { id: "eng_asv", name: "American Standard Version" },
  { id: "eng_net", name: "NET Bible" },
] as const;

/** Public-domain commentaries on helloao */
export const FEATURED_COMMENTARIES = [
  { id: "matthew-henry", name: "Matthew Henry" },
  { id: "jamieson-fausset-brown", name: "Jamieson-Fausset-Brown" },
  { id: "john-gill", name: "John Gill" },
  { id: "adam-clarke", name: "Adam Clarke" },
  { id: "keil-delitzsch", name: "Keil & Delitzsch (OT)" },
  { id: "tyndale", name: "Tyndale Open Study Notes" },
] as const;

export type CommentaryId = (typeof FEATURED_COMMENTARIES)[number]["id"];

const COMMENTARY_IDS = new Set<string>(
  FEATURED_COMMENTARIES.map((c) => c.id),
);

export function resolveCommentaryId(value: unknown): CommentaryId | null {
  if (typeof value !== "string" || !COMMENTARY_IDS.has(value)) {
    return null;
  }
  return value as CommentaryId;
}

/** Maps display book names → helloao book IDs */
export const BOOK_NAME_TO_ID: Record<string, string> = {
  Genesis: "GEN",
  Exodus: "EXO",
  Leviticus: "LEV",
  Numbers: "NUM",
  Deuteronomy: "DEU",
  Joshua: "JOS",
  Judges: "JDG",
  Ruth: "RUT",
  "1 Samuel": "1SA",
  "2 Samuel": "2SA",
  "1 Kings": "1KI",
  "2 Kings": "2KI",
  "1 Chronicles": "1CH",
  "2 Chronicles": "2CH",
  Ezra: "EZR",
  Nehemiah: "NEH",
  Esther: "EST",
  Job: "JOB",
  Psalms: "PSA",
  Proverbs: "PRO",
  Ecclesiastes: "ECC",
  "Song of Solomon": "SNG",
  Isaiah: "ISA",
  Jeremiah: "JER",
  Lamentations: "LAM",
  Ezekiel: "EZK",
  Daniel: "DAN",
  Hosea: "HOS",
  Joel: "JOL",
  Amos: "AMO",
  Obadiah: "OBA",
  Jonah: "JON",
  Micah: "MIC",
  Nahum: "NAM",
  Habakkuk: "HAB",
  Zephaniah: "ZEP",
  Haggai: "HAG",
  Zechariah: "ZEC",
  Malachi: "MAL",
  Matthew: "MAT",
  Mark: "MRK",
  Luke: "LUK",
  John: "JHN",
  Acts: "ACT",
  Romans: "ROM",
  "1 Corinthians": "1CO",
  "2 Corinthians": "2CO",
  Galatians: "GAL",
  Ephesians: "EPH",
  Philippians: "PHP",
  Colossians: "COL",
  "1 Thessalonians": "1TH",
  "2 Thessalonians": "2TH",
  "1 Timothy": "1TI",
  "2 Timothy": "2TI",
  Titus: "TIT",
  Philemon: "PHM",
  Hebrews: "HEB",
  James: "JAS",
  "1 Peter": "1PE",
  "2 Peter": "2PE",
  "1 John": "1JN",
  "2 John": "2JN",
  "3 John": "3JN",
  Jude: "JUD",
  Revelation: "REV",
};

/**
 * Alternate spellings people type that map to BOOK_NAME_TO_ID keys.
 * Matched longest-first alongside canonical names in parsePassageReference.
 */
export const BOOK_NAME_ALIASES: Record<string, keyof typeof BOOK_NAME_TO_ID | string> = {
  Psalm: "Psalms",
  "Song of Songs": "Song of Solomon",
  Canticles: "Song of Solomon",
  Apocalypse: "Revelation",
};


export type HelloaoVerse = {
  number: number;
  text: string;
};

export type HelloaoPassage = {
  reference: string;
  text: string;
  translationId: string;
  translationName: string;
  verses: HelloaoVerse[];
  bookName: string;
  chapter: number;
};

export type HelloaoCommentaryEntry = {
  verseStart: number;
  text: string;
};

export type HelloaoCommentaryChapter = {
  reference: string;
  commentaryId: string;
  commentaryName: string;
  bookName: string;
  chapter: number;
  introduction?: string;
  entries: HelloaoCommentaryEntry[];
};

type ChapterContentItem = {
  type: string;
  number?: number;
  content?: unknown[];
};

function extractTextFromContent(content: unknown[]): string {
  return content
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "text" in item) {
        return String((item as { text: string }).text);
      }
      return "";
    })
    .join("")
    .trim();
}

export function parsePassageReference(input: string): {
  bookName: string;
  bookId: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
} | null {
  const trimmed = input.trim();

  const candidates: { matchAs: string; bookName: string; bookId: string }[] = [
    ...Object.entries(BOOK_NAME_TO_ID).map(([bookName, bookId]) => ({
      matchAs: bookName,
      bookName,
      bookId,
    })),
    ...Object.entries(BOOK_NAME_ALIASES).flatMap(([alias, canonical]) => {
      const bookId = BOOK_NAME_TO_ID[canonical];
      if (!bookId) return [];
      return [{ matchAs: alias, bookName: canonical, bookId }];
    }),
  ].sort((a, b) => b.matchAs.length - a.matchAs.length);

  for (const { matchAs, bookName, bookId } of candidates) {
    const escaped = matchAs.replace(/\s+/g, "\\s+");
    const regex = new RegExp(
      `^${escaped}\\s+(\\d+)(?::(\\d+)(?:\\s*[-–]\\s*(\\d+))?)?$`,
      "i",
    );
    const match = trimmed.match(regex);
    if (!match) continue;

    return {
      bookName,
      bookId,
      chapter: parseInt(match[1], 10),
      verseStart: match[2] ? parseInt(match[2], 10) : undefined,
      verseEnd: match[3] ? parseInt(match[3], 10) : undefined,
    };
  }

  return null;
}

export function parseChapterResponse(
  data: {
    translation: { id: string; name?: string; englishName?: string };
    book: { name: string; commonName: string };
    chapter: { number: number; content: ChapterContentItem[] };
  },
  verseStart?: number,
  verseEnd?: number,
): HelloaoPassage {
  const verses: HelloaoVerse[] = [];

  for (const item of data.chapter.content) {
    if (item.type !== "verse" || item.number == null || !item.content) continue;
    const text = extractTextFromContent(item.content);
    if (!text) continue;
    verses.push({ number: item.number, text });
  }

  const start = verseStart ?? verses[0]?.number;
  const end = verseEnd ?? verseStart ?? verses[verses.length - 1]?.number;

  const filtered =
    start != null
      ? verses.filter((v) => {
          if (end != null && start !== end) {
            return v.number >= start && v.number <= end;
          }
          return verseStart != null ? v.number === start : true;
        })
      : verses;

  const bookName = data.book.commonName || data.book.name;
  const chapter = data.chapter.number;
  const ref =
    start != null && end != null && start !== end
      ? `${bookName} ${chapter}:${start}-${end}`
      : start != null
        ? `${bookName} ${chapter}:${start}`
        : `${bookName} ${chapter}`;

  return {
    reference: ref,
    text: filtered.map((v) => v.text).join(" "),
    translationId: data.translation.id,
    translationName:
      data.translation.englishName ?? data.translation.name ?? data.translation.id,
    verses: filtered,
    bookName,
    chapter,
  };
}

function selectCommentaryEntries(
  entries: HelloaoCommentaryEntry[],
  verseStart?: number,
  verseEnd?: number,
): HelloaoCommentaryEntry[] {
  if (verseStart == null) return entries;

  const end = verseEnd ?? verseStart;
  return entries.filter((entry, index) => {
    const nextStart = entries[index + 1]?.verseStart ?? Number.POSITIVE_INFINITY;
    const blockEnd = nextStart - 1;
    return entry.verseStart <= end && blockEnd >= verseStart;
  });
}

export function parseCommentaryChapterResponse(
  data: {
    commentary: {
      id: string;
      englishName?: string;
      name: string;
    };
    book: { name: string; commonName: string };
    chapter: {
      number: number;
      introduction?: string;
      content: ChapterContentItem[];
    };
  },
  verseStart?: number,
  verseEnd?: number,
): HelloaoCommentaryChapter {
  const entries: HelloaoCommentaryEntry[] = [];

  for (const item of data.chapter.content) {
    if (item.type !== "verse" || item.number == null || !item.content) continue;
    const text = extractTextFromContent(item.content);
    if (!text) continue;
    entries.push({ verseStart: item.number, text });
  }

  const bookName = data.book.commonName || data.book.name;
  const chapter = data.chapter.number;
  const filtered = selectCommentaryEntries(entries, verseStart, verseEnd);
  const ref =
    verseStart != null
      ? `${bookName} ${chapter}:${verseStart}${verseEnd != null && verseEnd !== verseStart ? `-${verseEnd}` : ""}`
      : `${bookName} ${chapter}`;

  return {
    reference: ref,
    commentaryId: data.commentary.id,
    commentaryName:
      data.commentary.englishName ??
      data.commentary.name ??
      data.commentary.id,
    bookName,
    chapter,
    introduction: data.chapter.introduction?.trim() || undefined,
    entries: filtered,
  };
}
