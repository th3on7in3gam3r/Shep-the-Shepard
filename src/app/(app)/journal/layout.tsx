import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = pageMetadata(
  "Journal",
  "Prayer journal linked to verses and conversations with Shep.",
);

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
