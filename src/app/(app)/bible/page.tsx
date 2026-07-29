import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { BibleReader } from "@/components/bible/bible-reader";

export default function BiblePage() {
  return (
    <>
      <PageHeader
        title="Bible"
        subtitle="Read Scripture with study notes, search, and saved verses"
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <BibleReader />
      </Suspense>
    </>
  );
}
