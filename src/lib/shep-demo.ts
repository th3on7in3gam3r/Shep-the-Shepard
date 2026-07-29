import { getLocalTimeOfDay } from "@/lib/build-shep-system-prompt";

const DEMO_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ["how are you", "how're you", "how r you", "how's it going", "how is it going"],
    response: `I'm doing well — thank you for asking!

How's your {{period}} going so far? I'm here if you want to talk, or we can open God's Word whenever you're ready.`,
  },
  {
    keywords: ["just talk", "just chat", "no thanks", "no thank you", "let's just talk", "lets just talk"],
    response: `Of course — we can just talk. No agenda, no pressure.

What's been on your mind {{period}}, or what have you been up to? I'm listening.`,
  },
  {
    keywords: ["hello", "hi shep", "hey shep", "good morning", "good afternoon", "good evening", "hey there"],
    response: `Hi — it's good to see you.

I'm doing well over here. How's your {{period}} going so far? We can chat about anything, or dig into Scripture whenever you'd like.`,
  },
  {
    keywords: ["anxious", "anxiety", "worry", "afraid", "fear", "stress"],
    response: `I hear the weight you're carrying, friend.

When my heart feels afraid, I cling to what Jesus told us in Matthew 6:34 — "Do not be anxious about tomorrow, for tomorrow will be anxious for itself."

And Isaiah 41:10 is such a comfort: "Fear not, for I am with you… I will strengthen you, I will help you."

Would you like to breathe and pray together? Tell me what's on your heart, and we can look at a verse that fits.`,
  },
  {
    keywords: ["sad", "grief", "lonely", "alone", "depressed", "hurt"],
    response: `Oh friend… Shep is right here beside you. You are not forgotten.

Psalm 34:18 says, "The Lord is near to the brokenhearted and saves the crushed in spirit." God sees every tear — even when the night feels long.

Jesus Himself wept with those who mourn (John 11:35). Your sorrow is not too much for Him.

May I pray with you? Or would a passage like Psalm 23 bring you some peace today?`,
  },
  {
    keywords: ["pray", "prayer", "how do i pray"],
    response: `What a beautiful question! Prayer is simply talking with our Heavenly Father — He loves to hear your voice.

Jesus taught us in Matthew 6:9–13 — we call it the Lord's Prayer. You can also speak from your heart: thanks, needs, confession, and listening in quiet.

Philippians 4:6–7 encourages us: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God."

Try this today: "Father, thank You for loving me. Help me with ___. Amen."

What's on your heart to bring before God right now?`,
  },
  {
    keywords: ["verse", "scripture", "bible", "read", "passage", "the word"],
    response: `Let's open God's Word together.

Some favorites for daily strength:
- **Psalm 23** — God's gentle care
- **John 3:16** — the heart of the Gospel
- **Romans 8:28** — hope in hard seasons
- **Philippians 4:13** — strength in Christ

"Your word is a lamp to my feet and a light to my path." — Psalm 119:105

Tell me a topic (peace, forgiveness, courage…) and I'll point you to a passage! You can also explore the **Bible** tab in Shepherd.`,
  },
  {
    keywords: ["forgive", "forgiveness", "grudge", "anger"],
    response: `Forgiveness is one of the hardest — and holiest — paths we walk.

Ephesians 4:32: "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you."

Jesus taught in Matthew 6:14–15 that as we forgive others, we reflect the mercy we've received. That doesn't mean harm wasn't real — it means we release the burden to God, who judges justly.

Would you like to talk through what's making forgiveness difficult? I'm listening with a soft heart.`,
  },
];

function periodPhrase(timeOfDay?: string): string {
  switch (timeOfDay) {
    case "morning":
      return "morning";
    case "afternoon":
      return "afternoon";
    case "evening":
      return "evening";
    case "night":
      return "night";
    default:
      return "day";
  }
}

const DEFAULT_RESPONSE = `I'm Shep the Shepherd — glad you're here.

We can simply talk, or walk through Scripture and prayer whenever you want.

How's your {{period}} going so far?`;

function fillPeriod(template: string, timeOfDay?: string): string {
  return template.replace(/\{\{period\}\}/g, periodPhrase(timeOfDay));
}

export function buildShepDemoResponse(
  userMessage: string,
  timeOfDay?: string,
): string {
  const lower = userMessage.toLowerCase();
  const tod = timeOfDay?.trim() || getLocalTimeOfDay();
  for (const { keywords, response } of DEMO_RESPONSES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return fillPeriod(response, tod);
    }
  }
  return fillPeriod(DEFAULT_RESPONSE, tod);
}

/** @deprecated */
export const buildLennyDemoResponse = buildShepDemoResponse;

export async function streamTextDeltas(
  text: string,
  onDelta: (delta: string) => void,
  delayMs = 12,
): Promise<void> {
  const words = text.split(/(\s+)/);
  for (const word of words) {
    onDelta(word);
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
