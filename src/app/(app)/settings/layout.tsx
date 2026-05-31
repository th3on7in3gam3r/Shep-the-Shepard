import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "Settings",
  "Profile, voice, appearance, account, and data export.",
);

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
