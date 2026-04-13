import "server-only";

import { getMiniMaxConfig } from "@/lib/env.server";
import type { ChattingSeoAnalysis, ChattingSeoAnalysisInput, ChattingSeoKeywordDifficulty, ChattingSeoKeywordIntent } from "@/lib/chatting-seo-analysis-types";
import { readNumber, readString, stripReasoningTags } from "@/lib/chatting-seo-analysis-service-shared";
const SYSTEM_PROMPT = "You are an internal SEO strategist for Chatting. Return strict JSON only with no markdown and no extra text.";
function buildPrompt(input: ChattingSeoAnalysisInput) {
  return `Analyze Chatting's SEO position using only the data below.

Rules:
- Stay grounded in the provided product truth and inventory.
- Do not invent competitor pricing, feature gaps, or current market facts.
- Focus on buyer intent, competitor framing, content gaps, and long-tail keyword opportunities Chatting can plausibly win.
- When live search research is present, use those researched queries and rankings as the primary basis for keywordOpportunities and competitorFindings.
- Use only these theme slugs in keywordOpportunities: ${input.themes.map((theme) => theme.slug).join(", ")}.
- Avoid topics already directly covered by the listed blog inventory.
- Keep summary to 1-2 sentences.

Product truth:
${JSON.stringify({
  productName: input.productName,
  canonicalUrl: input.canonicalUrl,
  siteTitle: input.siteTitle,
  siteDescription: input.siteDescription,
  pricingAnchor: input.pricingAnchor,
  positioning: input.positioning,
  founderApprovedClaims: input.founderApprovedClaims,
  verifiedProductCoverage: input.verifiedProductCoverage,
  bestFit: input.bestFit,
  notFit: input.notFit,
  contentFit: input.contentFit,
  contentMisfit: input.contentMisfit
})}

Competitors:
${JSON.stringify(input.competitors)}

Current blog inventory:
${JSON.stringify(input.blogPosts)}

Live search research:
${JSON.stringify(input.liveResearch ?? null)}

Guides:
${JSON.stringify(input.guides)}

Free tools:
${JSON.stringify(input.freeTools)}

Candidate keyword pool:
${JSON.stringify(input.candidates)}

Return JSON with this shape:
{
  "summary": "string",
  "audienceInsights": [
    { "label": "string", "rationale": "string", "opportunity": "string" }
  ],
  "competitorFindings": [
    {
      "slug": "string",
      "name": "string",
      "coverage": "strong|partial|gap",
      "finding": "string",
      "opportunity": "string",
      "recommendedKeyword": "string"
    }
  ],
  "keywordOpportunities": [
    {
      "keyword": "string",
      "title": "string",
      "themeSlug": "string",
      "intent": "commercial|informational|comparison",
      "difficulty": "low|medium|high",
      "audienceLabel": "string",
      "rationale": "string",
      "priority": 0-100
    }
  ],
  "contentGaps": ["string"]
}`;
}
function sanitizeAnalysis(input: ChattingSeoAnalysisInput, payload: unknown): ChattingSeoAnalysis {
  const parsed = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const allowedThemes = new Set(input.themes.map((theme) => theme.slug));
  const keywordOpportunities = (Array.isArray(parsed.keywordOpportunities) ? parsed.keywordOpportunities : [])
    .map((entry) => (entry && typeof entry === "object" ? entry : {}))
    .map((entry) => {
      const record = entry as Record<string, unknown>;
      const themeSlug = readString(record.themeSlug);
      return {
        keyword: readString(record.keyword),
        title: readString(record.title),
        themeSlug: allowedThemes.has(themeSlug) ? themeSlug : input.themes[0]?.slug ?? "comparisons",
        intent: (["commercial", "informational", "comparison"].includes(readString(record.intent))
          ? readString(record.intent)
          : "informational") as ChattingSeoKeywordIntent,
        difficulty: (["low", "medium", "high"].includes(readString(record.difficulty))
          ? readString(record.difficulty)
          : "medium") as ChattingSeoKeywordDifficulty,
        audienceLabel: readString(record.audienceLabel),
        rationale: readString(record.rationale),
        priority: Math.max(0, Math.min(100, readNumber(record.priority)))
      };
    })
    .filter((entry) => entry.keyword && entry.title && entry.rationale)
    .slice(0, 8);

  if (!keywordOpportunities.length) {
    throw new Error("INVALID_CHATTING_SEO_ANALYSIS_RESPONSE");
  }

  return {
    source: "ai",
    researchSource: input.liveResearch?.source === "live" ? "live" : "fallback",
    generatedAt: new Date().toISOString(),
    summary: readString(parsed.summary),
    audienceInsights: (Array.isArray(parsed.audienceInsights) ? parsed.audienceInsights : [])
      .map((entry) => (entry && typeof entry === "object" ? entry : {}))
      .map((entry) => {
        const record = entry as Record<string, unknown>;
        return {
          label: readString(record.label),
          rationale: readString(record.rationale),
          opportunity: readString(record.opportunity)
        };
      })
      .filter((entry) => entry.label && entry.rationale && entry.opportunity)
      .slice(0, 3),
    competitorFindings: (Array.isArray(parsed.competitorFindings) ? parsed.competitorFindings : [])
      .map((entry) => (entry && typeof entry === "object" ? entry : {}))
      .map((entry) => {
        const record = entry as Record<string, unknown>;
        const coverage = readString(record.coverage);
        return {
          slug: readString(record.slug),
          name: readString(record.name),
          coverage: (["strong", "partial", "gap"].includes(coverage) ? coverage : "gap") as "strong" | "partial" | "gap",
          finding: readString(record.finding),
          opportunity: readString(record.opportunity),
          recommendedKeyword: readString(record.recommendedKeyword)
        };
      })
      .filter((entry) => entry.slug && entry.name && entry.finding && entry.opportunity && entry.recommendedKeyword)
      .slice(0, 4),
    keywordOpportunities,
    contentGaps: (Array.isArray(parsed.contentGaps) ? parsed.contentGaps : [])
      .map((entry) => readString(entry))
      .filter(Boolean)
      .slice(0, 4)
  };
}
export async function generateChattingSeoAnalysis(input: ChattingSeoAnalysisInput): Promise<ChattingSeoAnalysis> {
  const config = getMiniMaxConfig();
  const response = await fetch(`${config.baseUrl}/v1/text/chatcompletion_v2`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      max_completion_tokens: 1400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(input) }
      ]
    })
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    base_resp?: { status_code?: unknown };
  };

  if (!response.ok || Number(payload.base_resp?.status_code) !== 0) {
    throw new Error("CHATTING_SEO_ANALYSIS_PROVIDER_FAILED");
  }

  const content = stripReasoningTags(readString(payload.choices?.[0]?.message?.content));
  if (!content) {
    throw new Error("INVALID_CHATTING_SEO_ANALYSIS_RESPONSE");
  }

  try {
    return sanitizeAnalysis(input, JSON.parse(content));
  } catch {
    throw new Error("INVALID_CHATTING_SEO_ANALYSIS_RESPONSE");
  }
}
