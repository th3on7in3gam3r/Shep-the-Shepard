import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SavedVersesView } from "@/components/favorites/saved-verses-view";
import { Button } from "@/components/ui/button";

export default function SavedPage() {
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
      <PageHeader title="Saved Verses" subtitle="Your favorite passages" />
      <SavedVersesView />
    </>
  );
}
