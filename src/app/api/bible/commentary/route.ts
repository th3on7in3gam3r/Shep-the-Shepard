import { NextRequest, NextResponse } from "next/server";
import {
  BOOK_NAME_TO_ID,
  HELLOAO_COMMENTARY_API,
  parseCommentaryChapterResponse,
  parsePassageReference,
  resolveCommentaryId,
} from "@/lib/bible-helloao";

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return undefined;
  return parsed;
}

export async function GET(req: NextRequest) {
  const commentaryId = resolveCommentaryId(
    req.nextUrl.searchParams.get("commentary"),
  );
  const book = req.nextUrl.searchParams.get("book");
  const chapterParam = req.nextUrl.searchParams.get("chapter");
  const passage = req.nextUrl.searchParams.get("passage");
  const verseStartParam = req.nextUrl.searchParams.get("verseStart");
  const verseEndParam = req.nextUrl.searchParams.get("verseEnd");

  if (!commentaryId) {
    return NextResponse.json(
      { error: "Missing or invalid commentary parameter" },
      { status: 400 },
    );
  }

  let bookId: string | undefined;
  let chapter = parsePositiveInt(chapterParam);
  let verseStart = parsePositiveInt(verseStartParam);
  let verseEnd = parsePositiveInt(verseEndParam);

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

  const url = `${HELLOAO_COMMENTARY_API}/${commentaryId}/${bookId}/${chapter}.json`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Commentary not found for this passage" },
        { status: res.status },
      );
    }
    const data = await res.json();
    const result = parseCommentaryChapterResponse(data, verseStart, verseEnd);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch commentary from Bible API" },
      { status: 502 },
    );
  }
}
