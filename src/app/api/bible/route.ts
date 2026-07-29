import { NextRequest, NextResponse } from "next/server";
import {
  BOOK_NAME_TO_ID,
  HELLOAO_API,
  parseChapterResponse,
  parsePassageReference,
} from "@/lib/bible-helloao";

export async function GET(req: NextRequest) {
  const translation =
    req.nextUrl.searchParams.get("translation") ?? "BSB";
  const book = req.nextUrl.searchParams.get("book");
  const chapterParam = req.nextUrl.searchParams.get("chapter");
  const passage = req.nextUrl.searchParams.get("passage");
  const verseStartParam = req.nextUrl.searchParams.get("verseStart");
  const verseEndParam = req.nextUrl.searchParams.get("verseEnd");

  let bookId: string | undefined;
  let chapter = chapterParam ? parseInt(chapterParam, 10) : undefined;
  let verseStart = verseStartParam ? parseInt(verseStartParam, 10) : undefined;
  let verseEnd = verseEndParam ? parseInt(verseEndParam, 10) : undefined;

  if (book) {
    bookId =
      BOOK_NAME_TO_ID[book] ??
      (book.length <= 3 ? book.toUpperCase() : undefined);
  }

  if (passage?.trim()) {
    const parsed = parsePassageReference(passage.trim());
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            'Could not parse passage. Try "John 3:16" or "Psalm 23:1-4".',
        },
        { status: 400 },
      );
    }
    bookId = parsed.bookId;
    chapter = parsed.chapter;
    verseStart = parsed.verseStart;
    verseEnd = parsed.verseEnd;
  }

  if (!bookId || !chapter) {
    return NextResponse.json(
      { error: "Missing book/chapter or passage parameter" },
      { status: 400 },
    );
  }

  const url = `${HELLOAO_API}/${translation}/${bookId}/${chapter}.json`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Passage not found for this translation" },
        { status: res.status },
      );
    }
    const data = await res.json();
    const result = parseChapterResponse(data, verseStart, verseEnd);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from Bible API" },
      { status: 502 },
    );
  }
}
