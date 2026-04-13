import "server-only";

import { getChattingSeoAnalysis } from "@/lib/chatting-seo-analysis";
import { listSeoKeywordCorpusRows } from "@/lib/repositories/seo-keyword-corpus-repository";
import type { SeoPlanItemRow } from "@/lib/repositories/seo-pipeline-repository-shared";

export type PlanItemRegenerationCandidate = {
  keyword: string;
  title: string;
  themeSlug: string;
  intent: string;
  audienceLabel: string;
  rationale: string;
  priority: number;
};

function keywordKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function getPlanItemRegenerationCandidates(input: {
  ownerUserId: string;
  actorUserId?: string | null;
  item: SeoPlanItemRow;
  runItems: SeoPlanItemRow[];
}) {
  const analysis = await getChattingSeoAnalysis({
    ownerUserId: input.ownerUserId,
    actorUserId: input.actorUserId ?? null
  });
  const usedKeywords = new Set(
    input.runItems
      .filter((entry) => entry.id !== input.item.id)
      .map((entry) => keywordKey(entry.target_keyword))
  );
  const candidates: PlanItemRegenerationCandidate[] = [];
  const seen = new Set<string>();
  const push = (candidate: PlanItemRegenerationCandidate) => {
    const key = keywordKey(candidate.keyword);
    if (!key || key === keywordKey(input.item.target_keyword) || usedKeywords.has(key) || seen.has(key)) return;
    seen.add(key);
    candidates.push(candidate);
  };

  analysis.keywordOpportunities.forEach((item) => {
    push({
      keyword: item.keyword,
      title: item.title,
      themeSlug: item.themeSlug,
      intent: item.intent,
      audienceLabel: item.audienceLabel,
      rationale: item.rationale,
      priority: item.priority
    });
  });

  (await listSeoKeywordCorpusRows(input.ownerUserId, 24)).forEach((row) => {
    push({
      keyword: row.keyword,
      title: row.suggested_title || row.keyword,
      themeSlug: row.theme_slug || input.item.theme_slug || "product",
      intent: row.intent,
      audienceLabel: row.audience_label || "Small teams",
      rationale: row.rationale,
      priority: row.opportunity_score
    });
  });

  return { analysis, candidates: candidates.slice(0, 12) };
}
