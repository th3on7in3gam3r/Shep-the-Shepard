import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME, FEEDBACK_EMAIL } from "@/lib/constants";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "Privacy",
  `How ${APP_NAME} handles your data, chat, and optional account sign-in.`,
);

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy" subtitle="Your data and your trust" />

      <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
        <Card>
          <CardContent className="space-y-3 pt-4">
            <h2 className="font-semibold">What we store</h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>
                <strong>On your device:</strong> chat history, journal, saved verses, streaks,
                and settings (browser local storage).
              </li>
              <li>
                <strong>When you chat:</strong> messages are sent to our server and to OpenAI
                to generate replies when live mode is enabled.
              </li>
              <li>
                <strong>Optional sign-in:</strong> if you use email sign-in, Supabase handles
                authentication; sync features may store your profile in the cloud when enabled.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-4">
            <h2 className="font-semibold">What we don&apos;t do</h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>We don&apos;t sell your personal data.</li>
              <li>We don&apos;t use your prayers for advertising.</li>
              <li>Community posts today stay on your device only (not a public feed).</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-4">
            <h2 className="font-semibold">Your choices</h2>
            <p className="text-muted-foreground">
              Export or clear your data from Settings. For questions, contact{" "}
              <a href={`mailto:${FEEDBACK_EMAIL}`} className="text-shepherd-sage hover:underline">
                {FEEDBACK_EMAIL}
              </a>
              .
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Last updated: May 2026. This policy may change as features (cloud sync, notifications)
          are added.
        </p>

        <Link href="/" className="inline-block text-sm font-medium text-shepherd-sage hover:underline">
          ← Back to home
        </Link>
      </div>
    </>
  );
}
