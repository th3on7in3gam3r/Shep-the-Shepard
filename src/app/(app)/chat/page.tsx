"use client";

import { ChatInterface } from "@/components/chat/chat-interface";
import { SHEP_FULL_NAME } from "@/lib/constants";

export default function ChatPage() {
  return (
    <>
      <header className="pb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-shepherd-sage">
          Voice · Scripture
        </p>
        <h1 className="font-heading text-xl font-semibold">{SHEP_FULL_NAME}</h1>
        <p className="text-sm text-muted-foreground">Hold to speak · grounded in God&apos;s Word</p>
      </header>
      <ChatInterface />
    </>
  );
}
