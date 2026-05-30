export type GuidedFlowId =
  | "lectio-divina"
  | "anxiety"
  | "grief"
  | "gratitude"
  | "understand-verse";

export type GuidedFlowStep = {
  title: string;
  shepIntro: string;
  userPrompt: string;
  durationHint?: string;
};

export type GuidedFlow = {
  id: GuidedFlowId;
  title: string;
  subtitle: string;
  icon: string;
  steps: GuidedFlowStep[];
};

export const GUIDED_FLOWS: Record<GuidedFlowId, GuidedFlow> = {
  "lectio-divina": {
    id: "lectio-divina",
    title: "Lectio Divina",
    subtitle: "Read · Reflect · Pray · Rest",
    icon: "📖",
    steps: [
      {
        title: "Read",
        shepIntro: "Find a quiet moment. Read the passage slowly — twice if you can.",
        userPrompt:
          "I'm starting lectio divina. Suggest a short passage to read slowly, then wait while I reflect.",
        durationHint: "~1 min",
      },
      {
        title: "Reflect",
        shepIntro: "What word or phrase is stirring in you? Don't force it — just notice.",
        userPrompt:
          "I've read the passage slowly. The phrase that stood out to me is: [share yours]. Help me reflect on why it might matter today.",
        durationHint: "~2 min",
      },
      {
        title: "Pray",
        shepIntro: "Turn your reflection into a simple conversation with God.",
        userPrompt:
          "Help me pray from what I noticed in Scripture. Keep it simple and honest.",
        durationHint: "~1 min",
      },
      {
        title: "Rest",
        shepIntro: "Sit quietly for a moment. God is with you — no words needed.",
        userPrompt:
          "I'm resting in God's presence after lectio divina. Offer a brief blessing to close this time.",
        durationHint: "~1 min",
      },
    ],
  },
  anxiety: {
    id: "anxiety",
    title: "When Anxiety Rises",
    subtitle: "5-minute voice path with Shep",
    icon: "🌊",
    steps: [
      {
        title: "Acknowledge",
        shepIntro: "Baa… I'm here. You don't have to carry this alone.",
        userPrompt:
          "I'm feeling anxious right now. I want to name what's weighing on me and bring it to God.",
        durationHint: "Hold to speak",
      },
      {
        title: "Scripture",
        shepIntro: "Let's anchor in a promise — not to fix everything, but to remember who's holding you.",
        userPrompt:
          "Share a gentle Scripture for anxiety and help me receive it — not as a cliché, but as truth.",
      },
      {
        title: "Pray",
        shepIntro: "Speak honestly to God. He can handle every fear.",
        userPrompt:
          "Help me pray honestly about my anxiety. Short, simple words I can repeat.",
      },
      {
        title: "Breathe",
        shepIntro: "One slow breath. Christ is nearer than the worry.",
        userPrompt:
          "Give me a brief closing reminder of God's presence as I go back into my day.",
      },
    ],
  },
  grief: {
    id: "grief",
    title: "Space for Grief",
    subtitle: "Gentle companionship — no rushing",
    icon: "💧",
    steps: [
      {
        title: "Honesty",
        shepIntro: "Grief is holy ground. You don't need to be strong here.",
        userPrompt:
          "I'm grieving and need a safe space. I don't need fixes — just to be heard and pointed to God gently.",
      },
      {
        title: "Lament",
        shepIntro: "The Psalms give us words when ours run dry.",
        userPrompt:
          "Share a lament psalm or passage for grief and help me sit with it for a moment.",
      },
      {
        title: "Hope",
        shepIntro: "Hope doesn't erase the ache — it walks beside it.",
        userPrompt:
          "Offer a word of hope that doesn't dismiss my pain. Keep it tender and true.",
      },
    ],
  },
  gratitude: {
    id: "gratitude",
    title: "Gratitude Pause",
    subtitle: "Name blessings · Give thanks",
    icon: "🙏",
    steps: [
      {
        title: "Pause",
        shepIntro: "Even on hard days, grace shows up in small ways.",
        userPrompt:
          "I want to practice gratitude. Help me pause and name three blessings — big or small.",
      },
      {
        title: "Scripture",
        shepIntro: "Thanksgiving turns the heart toward the Giver.",
        userPrompt:
          "Share a verse about gratitude and help me connect it to my life today.",
      },
      {
        title: "Pray",
        shepIntro: "Say thank you out loud. Heaven listens.",
        userPrompt:
          "Help me pray a short prayer of thanksgiving based on what I'm grateful for today.",
      },
    ],
  },
  "understand-verse": {
    id: "understand-verse",
    title: "Understand This Verse",
    subtitle: "Context · meaning · application",
    icon: "💡",
    steps: [
      {
        title: "Context",
        shepIntro: "Every verse has a story — let's situate it in Scripture.",
        userPrompt:
          "I'm studying a verse and want to understand its context. Help me see who wrote it, to whom, and what's happening around it.",
      },
      {
        title: "Meaning",
        shepIntro: "What is God saying through these words?",
        userPrompt:
          "Help me unpack the meaning of this passage in plain language — without losing depth.",
      },
      {
        title: "Application",
        shepIntro: "Scripture isn't only for knowing — it's for living.",
        userPrompt:
          "How might this verse shape my thoughts, choices, or prayers this week?",
      },
    ],
  },
};

export const GUIDED_FLOW_LIST = Object.values(GUIDED_FLOWS);
