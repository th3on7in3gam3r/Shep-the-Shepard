import type { ShepMood } from "@/components/shep-avatar";
import type { HeartMood } from "@/lib/mood-scripture";

export function heartMoodToShepMood(mood: HeartMood): ShepMood {
  switch (mood) {
    case "joyful":
    case "grateful":
    case "peaceful":
      return "happy";
    case "anxious":
    case "weary":
      return "listening";
    case "grieving":
      return "thinking";
    default:
      return "idle";
  }
}
