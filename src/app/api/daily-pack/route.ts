import {
  DEFAULT_TRANSLATION,
  HELLOAO_API,
  parseChapterResponse,
  parsePassageReference,
} from "@/lib/bible-helloao";
import {
  buildDailyPack,
  DEFAULT_STUDY_PASSAGE,
  mergeStudyChapter,
} from "@/lib/daily-pack";

async function fetchStudyChapter() {
  const parsed = parsePassageReference(DEFAULT_STUDY_PASSAGE);
  if (!parsed) return null;

  const url = `${HELLOAO_API}/${DEFAULT_TRANSLATION}/${parsed.bookId}/${parsed.chapter}.json`;
  const res = await fetch(url, { next: { revalidate: 86_400 } });
  if (!res.ok) return null;

  const data = await res.json();
  const result = parseChapterResponse(data, parsed.verseStart, parsed.verseEnd);
  return {
    reference: result.reference,
    text: result.text,
    translationName: result.translationName,
    translationId: result.translationId,
  };
}

export async function GET() {
  const pack = buildDailyPack();

  try {
    const studyChapter = await fetchStudyChapter();
    const full = studyChapter ? mergeStudyChapter(pack, studyChapter) : pack;
    return Response.json(full, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json(pack, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }
}
