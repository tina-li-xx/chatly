import "server-only";

import { getChattingSeoAnalysis } from "@/lib/chatting-seo-analysis";
import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { buildFallbackChattingSeoPlan } from "@/lib/chatting-seo-plan-fallback";
import { generateChattingSeoPlan } from "@/lib/chatting-seo-plan-service";
import type { ChattingSeoGeneratedPlan } from "@/lib/chatting-seo-plan-types";

export async function getChattingSeoGeneratedPlan(input?: {
  ownerUserId?: string;
  actorUserId?: string | null;
}): Promise<ChattingSeoGeneratedPlan> {
  const analysis = await getChattingSeoAnalysis(input);
  const fallback = buildFallbackChattingSeoPlan(chattingSeoProfile, analysis);

  try {
    const live = await generateChattingSeoPlan(chattingSeoProfile, analysis);
    return {
      ...live,
      summary: live.summary || fallback.summary
    };
  } catch {
    return fallback;
  }
}
