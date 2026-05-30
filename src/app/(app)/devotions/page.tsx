import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { DevotionView } from "@/components/devotions/devotion-view";

export default function DevotionsPage() {
  return (
    <>
      <PageHeader
        title="Daily Devotion"
        subtitle={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />
      <Suspense fallback={null}>
        <DevotionView />
      </Suspense>
    </>
  );
}
