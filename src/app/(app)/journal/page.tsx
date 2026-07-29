import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { JournalView } from "@/components/journal/journal-view";
import { Button } from "@/components/ui/button";

export default function JournalPage() {
  return (
    <>
      <div className="mb-2">
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <ChevronLeft className="size-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>
      <PageHeader title="Prayer Journal" subtitle="Notes tied to verses & reflections" />
      <Suspense fallback={null}>
        <JournalView />
      </Suspense>
    </>
  );
}
