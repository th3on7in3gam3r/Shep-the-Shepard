import { NextResponse } from "next/server";
import {
  FEATURED_COMMENTARIES,
  HELLOAO_API,
} from "@/lib/bible-helloao";

export async function GET() {
  try {
    const res = await fetch(`${HELLOAO_API}/available_commentaries.json`, {
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) {
      return NextResponse.json({ commentaries: FEATURED_COMMENTARIES });
    }
    const data = await res.json();
    const featuredIds = new Set<string>(
      FEATURED_COMMENTARIES.map((c) => c.id),
    );
    const featured = (data.commentaries ?? []).filter(
      (c: { id: string }) => featuredIds.has(c.id),
    );
    const mapped = featured.map(
      (c: { id: string; englishName?: string; name: string }) => ({
        id: c.id,
        name: c.englishName ?? c.name,
      }),
    );
    return NextResponse.json({
      commentaries: mapped.length > 0 ? mapped : FEATURED_COMMENTARIES,
    });
  } catch {
    return NextResponse.json({ commentaries: FEATURED_COMMENTARIES });
  }
}
