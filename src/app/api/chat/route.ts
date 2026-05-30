import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { buildShepSystemPrompt } from "@/lib/build-shep-system-prompt";
import { dedupeChatMessages } from "@/lib/chat-utils";
import {
  getOpenAiApiKey,
  getOpenAiModel,
  getOpenAiTemperature,
  isOpenAiConfigured,
} from "@/lib/openai-config";
import {
  buildShepDemoResponse,
  streamTextDeltas,
} from "@/lib/shep-demo";
import {
  checkRateLimit,
  getClientIp,
  parseChatRateLimitConfig,
} from "@/lib/rate-limit";

export const maxDuration = 30;

type ChatRequestBody = {
  messages?: UIMessage[];
  userName?: string;
};

function rateLimitResponse(retryAfterSec: number) {
  return new Response(
    JSON.stringify({
      error: "Too many messages. Please wait a moment and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}

function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getLastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "user") continue;
    return msg.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("");
  }
  return "";
}

export async function POST(req: Request) {
  // When Supabase auth lands, require a valid session here before processing.
  // if (process.env.REQUIRE_AUTH === "true" && !(await getSession(req))) {
  //   return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  // }

  const { max, windowMs } = parseChatRateLimitConfig();
  const rateKey = `chat:${getClientIp(req)}`;
  const limit = checkRateLimit(rateKey, max, windowMs);
  if (!limit.success) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body", 400);
  }

  const messages = dedupeChatMessages(Array.isArray(body.messages) ? body.messages : []);
  if (messages.length === 0) {
    return errorResponse("Messages required", 400);
  }

  if (isOpenAiConfigured()) {
    try {
      const result = streamText({
        model: openai(getOpenAiModel()),
        system: buildShepSystemPrompt(body.userName),
        messages: await convertToModelMessages(messages),
        temperature: getOpenAiTemperature(),
      });
      return result.toUIMessageStreamResponse();
    } catch (error) {
      console.error("[chat] OpenAI request failed:", error);
      const message =
        error instanceof Error &&
        /incorrect api key|invalid_api_key|authentication/i.test(error.message)
          ? "OpenAI API key is invalid. Check OPENAI_API_KEY in .env.local and restart the dev server."
          : "Shep couldn't reach OpenAI right now. Please try again in a moment.";
      return errorResponse(message, 502);
    }
  }

  if (process.env.NODE_ENV === "production" && !getOpenAiApiKey()) {
    return errorResponse(
      "Live chat is not configured. Set OPENAI_API_KEY on the server.",
      503,
    );
  }

  const reply = buildShepDemoResponse(getLastUserText(messages));
  const textId = "shep-demo-text";

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      writer.write({ type: "text-start", id: textId });
      await streamTextDeltas(reply, (delta) => {
        writer.write({ type: "text-delta", id: textId, delta });
      });
      writer.write({ type: "text-end", id: textId });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
