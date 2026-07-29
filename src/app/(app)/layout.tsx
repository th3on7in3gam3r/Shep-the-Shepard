import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { APP_TAGLINE } from "@/lib/constants";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "Home",
  `Daily quests, verse of the day, and ${APP_TAGLINE.toLowerCase()}.`,
);

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
