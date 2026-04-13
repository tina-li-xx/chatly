import "server-only";

import { chattingSeoProfile } from "@/lib/chatting-seo-profile";
import { buildFallbackChattingSeoDraft } from "@/lib/chatting-seo-draft-fallback";
import { generateChattingSeoDraft } from "@/lib/chatting-seo-draft-service";
import type { BlogPost } from "@/lib/blog-types";
import type { SeoPlanItemRow } from "@/lib/repositories/seo-pipeline-repository-shared";

export async function getChattingSeoDraft(planItem: SeoPlanItemRow): Promise<{ source: "ai" | "fallback"; post: BlogPost; heroImagePrompt: string }> {
  const fallback = buildFallbackChattingSeoDraft({ profile: chattingSeoProfile, planItem });

  try {
    return {
      source: "ai",
      post: await generateChattingSeoDraft(chattingSeoProfile, planItem),
      heroImagePrompt: `Editorial hero illustration for "${planItem.title}" in Chatting's blog style.`
    };
  } catch {
    return {
      source: "fallback",
      post: fallback,
      heroImagePrompt: `Editorial hero illustration for "${planItem.title}" in Chatting's fallback blog style.`
    };
  }
}
