import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { BibleReader } from "@/components/bible/bible-reader";
import { BibleReaderSkeleton } from "@/components/bible/bible-reader-skeleton";

export default function BiblePage() {
  return (
    <>
      <PageHeader
        title="Bible"
        subtitle="Read Scripture with study notes, search, and saved verses"
      />
      <Suspense fallback={<BibleReaderSkeleton />}>
        <BibleReader />
      </Suspense>
    </>
  );
}
