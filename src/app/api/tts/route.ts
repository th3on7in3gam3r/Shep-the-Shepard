import { experimental_generateSpeech as generateSpeech } from "ai";
import {
  DEFAULT_SHEP_OPENAI_VOICE,
  SHEP_OPENAI_VOICES,
  type ShepOpenAiVoice,
} from "@/lib/shep-voice";
import {
  createOpenAiProvider,
  resolveOpenAiApiKey,
} from "@/lib/openai-config";

export const maxDuration = 30;

function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const resolved = resolveOpenAiApiKey(req);
  if (resolved.error) {
    return errorResponse(resolved.error, 400);
  }
  if (!resolved.apiKey) {
    return errorResponse(
      "OpenAI is not configured. Add OPENAI_API_KEY to .env.local, or your own key in Settings.",
      503,
    );
  }

  let body: { text?: string; voice?: string; speed?: number };
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body");
  }

  const text = body.text?.trim();
  if (!text) return errorResponse("Text required");

  const cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\bBaa{1,8}[!….]?\s*/gi, "")
    .replace(/🐑|💚|🙏|📖|🌿/gu, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 4096);

  const voiceId = body.voice as ShepOpenAiVoice;
  const voice =
    voiceId && voiceId in SHEP_OPENAI_VOICES
      ? voiceId
      : DEFAULT_SHEP_OPENAI_VOICE;

  const speed =
    typeof body.speed === "number"
      ? Math.min(1.15, Math.max(0.75, body.speed))
      : 0.95;

  try {
    const openai = createOpenAiProvider(resolved.apiKey);
    const result = await generateSpeech({
      model: openai.speech("tts-1-hd"),
      text: cleaned,
      voice,
      speed,
      instructions:
        "Speak warmly and gently, like a caring shepherd companion sharing Scripture. Natural, unhurried, pastoral — not robotic.",
    });

    const audio = result.audio;

    return new Response(Buffer.from(audio.uint8Array), {
      headers: {
        "Content-Type": audio.mediaType ?? "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[tts] OpenAI speech failed:", error);
    if (
      error instanceof Error &&
      /incorrect api key|invalid_api_key|authentication/i.test(error.message)
    ) {
      return errorResponse(
        resolved.source === "user"
          ? "Your OpenAI API key looks invalid. Check it in Settings."
          : "OpenAI API key is invalid.",
        502,
      );
    }
    return errorResponse("Could not generate speech. Try again.", 502);
  }
}
