"use client";

import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GUIDED_FLOW_LIST } from "@/lib/guided-flows";
import { useGuidedFlowStore } from "@/stores/guided-flow-store";

export function GuidedFlowsCard() {
  const router = useRouter();
  const startFlow = useGuidedFlowStore((s) => s.startFlow);

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-shepherd-sage" />
          <p className="text-sm font-medium">Guided journeys with Shep</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Step-by-step paths — not just free-form chat.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {GUIDED_FLOW_LIST.filter((f) => f.id !== "understand-verse").map((flow) => (
            <Button
              key={flow.id}
              variant="outline"
              className="h-auto flex-col items-start gap-0.5 px-3 py-2.5 text-left"
              onClick={() => {
                startFlow(flow.id);
                router.push("/chat");
              }}
            >
              <span className="text-base">{flow.icon}</span>
              <span className="text-sm font-medium">{flow.title}</span>
              <span className="text-[11px] font-normal text-muted-foreground">
                {flow.subtitle}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
