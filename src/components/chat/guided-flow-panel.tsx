"use client";

import { ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUIDED_FLOWS } from "@/lib/guided-flows";
import { useChatContextStore } from "@/stores/chat-context-store";
import { useGuidedFlowStore } from "@/stores/guided-flow-store";

type GuidedFlowPanelProps = {
  onSendStep: (message: string) => void;
};

function buildStepMessage(
  flowId: keyof typeof GUIDED_FLOWS,
  stepIndex: number,
  verseContext: { reference: string; text: string; translation: string } | null,
): string {
  const flow = GUIDED_FLOWS[flowId];
  const step = flow.steps[stepIndex];
  if (!step) return "";

  if (verseContext && flowId === "understand-verse") {
    const snippet =
      verseContext.text.length > 300
        ? `${verseContext.text.slice(0, 300)}…`
        : verseContext.text;
    return `${step.userPrompt}\n\nThe verse is ${verseContext.reference} (${verseContext.translation}):\n"${snippet}"`;
  }

  return step.userPrompt;
}

export function GuidedFlowPanel({ onSendStep }: GuidedFlowPanelProps) {
  const activeFlowId = useGuidedFlowStore((s) => s.activeFlowId);
  const stepIndex = useGuidedFlowStore((s) => s.stepIndex);
  const verseContext = useGuidedFlowStore((s) => s.verseContext);
  const nextStep = useGuidedFlowStore((s) => s.nextStep);
  const endFlow = useGuidedFlowStore((s) => s.endFlow);

  if (!activeFlowId) return null;

  const flow = GUIDED_FLOWS[activeFlowId];
  const step = flow.steps[stepIndex];
  const isLast = stepIndex >= flow.steps.length - 1;

  if (!step) {
    endFlow();
    return null;
  }

  const handleContinue = () => {
    const message = buildStepMessage(activeFlowId, stepIndex, verseContext);
    onSendStep(message);
    if (isLast) {
      endFlow();
    } else {
      nextStep();
    }
  };

  return (
    <div className="rounded-2xl border border-shepherd-sage/30 bg-shepherd-meadow/15 px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-shepherd-sage">
            {flow.icon} {flow.title} · Step {stepIndex + 1}/{flow.steps.length}
          </p>
          <p className="mt-0.5 text-sm font-semibold">{step.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {step.shepIntro}
          </p>
          {step.durationHint && (
            <p className="mt-1 text-[10px] text-shepherd-sky">{step.durationHint}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="End guided flow"
          onClick={endFlow}
        >
          <X className="size-3.5" />
        </Button>
      </div>
      <Button
        size="sm"
        className="mt-3 h-8 w-full bg-shepherd-sage hover:bg-shepherd-sage/90"
        onClick={handleContinue}
      >
        {isLast ? "Finish with Shep" : "Continue"}
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
}

export function ChatContextBanner() {
  const label = useChatContextStore((s) => s.activeLabel);
  if (!label) return null;

  return (
    <p className="rounded-lg bg-shepherd-sage/10 px-3 py-2 text-xs text-shepherd-sage">
      {label}
    </p>
  );
}
