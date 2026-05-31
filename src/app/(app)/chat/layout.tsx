import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-metadata";
import { SHEP_FULL_NAME } from "@/lib/constants";

export const metadata: Metadata = pageMetadata(
  "Talk to Shep",
  `Voice-first chat with ${SHEP_FULL_NAME} — Scripture-grounded encouragement and Bible help.`,
);

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
