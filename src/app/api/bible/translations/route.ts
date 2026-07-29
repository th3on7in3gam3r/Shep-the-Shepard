import { NextResponse } from "next/server";
import { FEATURED_TRANSLATIONS, HELLOAO_API } from "@/lib/bible-helloao";

export async function GET() {
  try {
    const res = await fetch(`${HELLOAO_API}/available_translations.json`, {
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) {
      return NextResponse.json({ translations: FEATURED_TRANSLATIONS });
    }
    const data = await res.json();
    const featuredIds = new Set<string>(
      FEATURED_TRANSLATIONS.map((t) => t.id),
    );
    const featured = (data.translations ?? []).filter(
      (t: { id: string }) => featuredIds.has(t.id),
    );
    const mapped = featured.map(
      (t: { id: string; englishName?: string; name: string }) => ({
        id: t.id,
        name: t.englishName ?? t.name,
      }),
    );
    return NextResponse.json({
      translations: mapped.length > 0 ? mapped : FEATURED_TRANSLATIONS,
    });
  } catch {
    return NextResponse.json({ translations: FEATURED_TRANSLATIONS });
  }
}
