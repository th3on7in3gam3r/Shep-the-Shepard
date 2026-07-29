import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, SHEP_FULL_NAME, SHEP_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "About",
  `Learn about ${APP_NAME} — a gentle, Scripture-grounded faith companion with ${SHEP_FULL_NAME}.`,
);

export default function AboutPage() {
  return (
    <>
      <PageHeader title="About Shepherd" subtitle="Who we are and who it's for" showShep />

      <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
        <Card>
          <CardContent className="space-y-3 pt-4">
            <p>
              <strong>{APP_NAME}</strong> is a daily Christian companion built around{" "}
              <strong>{SHEP_FULL_NAME}</strong> — a gentle companion who helps you stay close
              to God&apos;s Word through conversation, reading, and small faithful habits.
            </p>
            <p>
              Talk to {SHEP_NAME} by voice or text, complete a short daily quest, check in on
              your heart, read the Bible, and reflect with devotions and journal entries.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-4">
            <h2 className="font-semibold">Who is it for?</h2>
            <p className="text-muted-foreground">
              Primarily <strong>teens and adults</strong> who want a warm, private space for
              Scripture and encouragement — not a replacement for church, parents, or
              professional care.
            </p>
            <p className="text-muted-foreground">
              Open-ended AI chat is best for older users; parents should guide younger
              children.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-4">
            <h2 className="font-semibold">Scripture first</h2>
            <p className="text-muted-foreground">
              {SHEP_NAME} grounds replies in the Bible and points you to Jesus — never
              replacing pastors, counselors, or emergency services when you need real help.
            </p>
          </CardContent>
        </Card>

        <Link href="/" className="inline-block text-sm font-medium text-shepherd-sage hover:underline">
          ← Back to home
        </Link>
      </div>
    </>
  );
}
