"use client";

import type { ShepMood } from "@/components/shep-avatar";
import { ShepProceduralModel } from "@/components/chat/shep-procedural-model";
import { ShepGlbModel } from "@/components/chat/shep-glb-model";
import { SHEP_USE_GLB } from "@/lib/shep-model-config";
import { getShepGlbAvailableSync } from "@/lib/shep-glb-availability";

type ShepCharacterProps = {
  mood: ShepMood;
  isSpeaking: boolean;
};

export function ShepCharacter(props: ShepCharacterProps) {
  if (!SHEP_USE_GLB || getShepGlbAvailableSync() !== true) {
    return <ShepProceduralModel {...props} />;
  }

  return <ShepGlbModel {...props} />;
}
