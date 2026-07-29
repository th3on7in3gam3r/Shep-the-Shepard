"use client";

import { useRouter } from "next/navigation";
import { Compass, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPassageChatContext } from "@/lib/chat-context";
import { useChatContextStore } from "@/stores/chat-context-store";
import { useGuidedFlowStore } from "@/stores/guided-flow-store";

type AskShepPassageProps = {
  reference: string;
  text: string;
  translationName: string;
  studyNote?: string;
  compact?: boolean;
};

export function AskShepPassageActions({
  reference,
  text,
  translationName,
  studyNote,
  compact = false,
}: AskShepPassageProps) {
  const router = useRouter();
  const setPending = useChatContextStore((s) => s.setPending);
  const startFlow = useGuidedFlowStore((s) => s.startFlow);

  const askShep = () => {
    setPending(
      buildPassageChatContext({
        reference,
        text,
        translationName,
        studyNote,
      }),
    );
    router.push("/chat");
  };

  const guidedStudy = () => {
    startFlow("understand-verse", {
      reference,
      text,
      translation: translationName,
    });
    router.push("/chat");
  };

  if (compact) {
    return (
      <Button
        size="sm"
        className="h-8 w-full bg-shepherd-sage hover:bg-shepherd-sage/90"
        onClick={askShep}
      >
        <MessageCircle className="size-3.5" />
        Ask Shep about this passage
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        className="flex-1 bg-shepherd-sage hover:bg-shepherd-sage/90"
        onClick={askShep}
      >
        <MessageCircle className="size-4" />
        Ask Shep about this passage
      </Button>
      <Button variant="outline" className="flex-1" onClick={guidedStudy}>
        <Compass className="size-4" />
        Guided study
      </Button>
    </div>
  );
}
