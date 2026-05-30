import {
  getOpenAiModel,
  isOpenAiConfigured,
} from "@/lib/openai-config";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  return Response.json({
    live: isOpenAiConfigured(),
    model: getOpenAiModel(),
    supabase: isSupabaseConfigured(),
  });
}
