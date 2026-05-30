import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsView } from "@/components/settings/settings-view";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
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
      <PageHeader title="Settings" subtitle="Profile, Bible, voice & more" />
      <SettingsView />
    </>
  );
}
