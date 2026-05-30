export type ShepChatContext = {
  label: string;
  initialMessage: string;
  reference?: string;
};

export function buildPassageChatContext(input: {
  reference: string;
  text: string;
  translationName: string;
  studyNote?: string;
}): ShepChatContext {
  const snippet = input.text.length > 400 ? `${input.text.slice(0, 400)}…` : input.text;
  let initialMessage = `Help me understand ${input.reference} (${input.translationName}).\n\n"${snippet}"\n\nWhat does this mean for my life today?`;

  if (input.studyNote) {
    const note =
      input.studyNote.length > 280 ? `${input.studyNote.slice(0, 280)}…` : input.studyNote;
    initialMessage += `\n\nI was also reading this study note:\n${note}`;
  }

  return {
    label: `Discussing ${input.reference}`,
    reference: input.reference,
    initialMessage,
  };
}

export function buildMemoryChatContext(input: {
  message: string;
  reference?: string;
  verseText?: string;
}): ShepChatContext {
  let initialMessage = input.message;
  if (input.reference && input.verseText) {
    initialMessage += `\n\nThe verse is ${input.reference}: "${input.verseText.slice(0, 200)}"`;
  }
  return {
    label: input.reference ? `Returning to ${input.reference}` : "Continuing your journey",
    reference: input.reference,
    initialMessage,
  };
}

export function buildMoodChatContext(moodLabel: string, prompt: string): ShepChatContext {
  return {
    label: `Heart check-in · ${moodLabel}`,
    initialMessage: prompt,
  };
}

export function buildFlowChatContext(flowTitle: string, stepPrompt: string): ShepChatContext {
  return {
    label: flowTitle,
    initialMessage: stepPrompt,
  };
}
