import "server-only";

import { getMiniMaxConfig } from "@/lib/env.server";
import { normalizeBlogFaqSections } from "@/lib/blog-faq-normalization";
import type { ChattingSeoProfile } from "@/lib/chatting-seo-profile";
import type { BlogPost } from "@/lib/blog-types";
import type { SeoPlanItemRow } from "@/lib/repositories/seo-pipeline-repository-shared";
import { defaultBlogImage, estimateBlogReadingTime, relatedBlogSlugs, uniqueBlogSlug } from "@/lib/chatting-seo-draft-shared";

const SYSTEM_PROMPT = "You write Chatting blog drafts for small-team SEO content. Return strict JSON only with no markdown and no extra text.";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => readString(item)).filter(Boolean) : [];
}

function stripReasoningTags(content: string) {
  const stripped = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  return stripped || content.trim();
}

function buildPrompt(profile: ChattingSeoProfile, planItem: SeoPlanItemRow) {
  return `Write a Chatting blog draft based on this plan item.

Rules:
- Write for Chatting from the first sentence.
- Keep the tone direct, practical, small-team, and anti-bloat.
- Do not invent competitor facts or pricing.
- Make Chatting the recommendation only when it genuinely fits.
- Return sections as plain strings and lists only. No markdown.

Product truth:
${JSON.stringify({
  positioning: profile.messaging.positioning,
  bestFit: profile.messaging.bestFit,
  contentFit: profile.messaging.contentFit,
  claimsDiscipline: profile.messaging.claimsDiscipline,
  ctas: profile.ctas
})}

Plan item:
${JSON.stringify({
  title: planItem.title,
  targetKeyword: planItem.target_keyword,
  searchIntent: planItem.search_intent,
  personaSlug: planItem.persona_slug,
  categorySlug: planItem.category_slug,
  ctaId: planItem.cta_id,
  rationale: planItem.rationale
})}

Return JSON:
{
  "title": "string",
  "excerpt": "string",
  "subtitle": "string",
  "seoTitle": "string",
  "intro": "string",
  "summaryBullets": ["string"],
  "sectionTwoTitle": "string",
  "sectionTwoParagraphs": ["string"],
  "sectionThreeTitle": "string",
  "sectionThreeBullets": ["string"],
  "bottomLineTitle": "string",
  "bottomLineParagraphs": ["string"],
  "faq": [{ "question": "string", "answer": "string" }]
}`;
}

function toPost(profile: ChattingSeoProfile, planItem: SeoPlanItemRow, payload: Record<string, unknown>): BlogPost {
  const slug = uniqueBlogSlug(readString(payload.title) || planItem.title);
  const categorySlug = planItem.category_slug || "product";
  const ctaTarget = profile.ctas.find((entry) => entry.id === planItem.cta_id) ?? profile.ctas[0];
  const sections = normalizeBlogFaqSections([
    {
      id: "short-version",
      title: "The short version",
      blocks: [
        { type: "paragraph", text: readString(payload.intro) },
        { type: "list", items: readList(payload.summaryBullets) }
      ]
    },
    {
      id: "section-two",
      title: readString(payload.sectionTwoTitle) || "What matters most",
      blocks: readList(payload.sectionTwoParagraphs).map((text) => ({ type: "paragraph", text }))
    },
    {
      id: "section-three",
      title: readString(payload.sectionThreeTitle) || "How to evaluate the tradeoffs",
      blocks: [{ type: "list", items: readList(payload.sectionThreeBullets) }]
    },
    {
      id: "bottom-line",
      title: readString(payload.bottomLineTitle) || "Bottom line",
      blocks: [
        ...readList(payload.bottomLineParagraphs).map((text) => ({ type: "paragraph", text })),
        { type: "faq", items: Array.isArray(payload.faq) ? payload.faq : [] },
        { type: "cta", title: ctaTarget?.label || "Start chatting free", text: `See how Chatting handles ${planItem.target_keyword} for small teams.`, buttonLabel: ctaTarget?.label || "Start chatting free", href: ctaTarget?.href || "/signup" }
      ]
    }
  ] as BlogPost["sections"]);

  if (!sections[0]?.blocks.length || !readString(payload.excerpt) || !readString(payload.subtitle)) {
    throw new Error("INVALID_CHATTING_SEO_DRAFT_RESPONSE");
  }

  return {
    slug,
    title: readString(payload.title) || planItem.title,
    excerpt: readString(payload.excerpt),
    subtitle: readString(payload.subtitle),
    seoTitle: readString(payload.seoTitle) || `${planItem.title} | Chatting`,
    publicationStatus: "draft",
    publishedAt: planItem.target_publish_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readingTime: estimateBlogReadingTime(sections),
    authorSlug: "tina",
    categorySlug: categorySlug as BlogPost["categorySlug"],
    image: defaultBlogImage(categorySlug),
    relatedSlugs: relatedBlogSlugs(categorySlug, slug),
    sections
  };
}

export async function generateChattingSeoDraft(profile: ChattingSeoProfile, planItem: SeoPlanItemRow): Promise<BlogPost> {
  const config = getMiniMaxConfig();
  const response = await fetch(`${config.baseUrl}/v1/text/chatcompletion_v2`, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.3,
      max_completion_tokens: 2400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(profile, planItem) }
      ]
    })
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    base_resp?: { status_code?: unknown };
  };

  if (!response.ok || Number(payload.base_resp?.status_code) !== 0) {
    throw new Error("CHATTING_SEO_DRAFT_PROVIDER_FAILED");
  }

  const content = stripReasoningTags(readString(payload.choices?.[0]?.message?.content));
  if (!content) {
    throw new Error("INVALID_CHATTING_SEO_DRAFT_RESPONSE");
  }

  try {
    return toPost(profile, planItem, JSON.parse(content) as Record<string, unknown>);
  } catch {
    throw new Error("INVALID_CHATTING_SEO_DRAFT_RESPONSE");
  }
}
