import "server-only";

import { normalizeBlogFaqSections } from "@/lib/blog-faq-normalization";
import type { ChattingSeoProfile } from "@/lib/chatting-seo-profile";
import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";
import type { BlogPost } from "@/lib/blog-types";
import type { SeoPlanItemRow } from "@/lib/repositories/seo-pipeline-repository-shared";
import { defaultBlogImage, estimateBlogReadingTime, relatedBlogSlugs, uniqueBlogSlug } from "@/lib/chatting-seo-draft-shared";

function personaLabel(value: string) {
  if (value === "support-leads") return "support leads";
  if (value === "sales-leads") return "sales leads";
  if (value === "ops-leads") return "operations leads";
  if (value === "ecommerce-operators") return "small ecommerce teams";
  return value.replace(/-/g, " ");
}

function titleCaseKeyword(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ctaTarget(profile: ChattingSeoProfile, ctaId: string) {
  const match = profile.ctas.find((entry) => entry.id === ctaId);
  return match ?? profile.ctas[0] ?? { label: "Start chatting free", href: "/signup" };
}

export function buildFallbackChattingSeoDraft(input: {
  profile: ChattingSeoProfile;
  planItem: SeoPlanItemRow;
}): BlogPost {
  const { profile, planItem } = input;
  const slug = uniqueBlogSlug(planItem.title);
  const keywordLabel = titleCaseKeyword(planItem.target_keyword);
  const categorySlug = planItem.category_slug || "product";
  const image = defaultBlogImage(categorySlug);
  const ctaTargetValue = ctaTarget(profile, planItem.cta_id);
  const sections = normalizeBlogFaqSections([
    section("short-version", "The short version", [
      paragraph(`${keywordLabel} matters because small teams need clearer guidance on when live chat is worth adding, how much process they actually need, and what a lighter-weight option looks like.`),
      list([
        `Chatting fits teams that want real-time website conversations without a heavier help desk rollout.`,
        `The right answer depends on workflow fit, response expectations, and whether the team needs live chat or a broader support suite.`,
        `This article keeps the recommendation grounded in the actual tradeoffs instead of flattening every tool into the same bucket.`
      ])
    ]),
    section("why-it-matters", `Why ${planItem.target_keyword} matters for small teams`, [
      paragraph(`Most ${personaLabel(planItem.persona_slug)} do not need a giant support stack. They need to understand the buying moment, respond quickly, and keep the workflow manageable for a lean team.`),
      paragraph(planItem.rationale || `This topic is high leverage for Chatting because it connects directly to the product's small-team positioning and real-time conversation workflow.`)
    ]),
    section("what-to-look-for", "What to look for before choosing a tool or workflow", [
      list([
        "How fast the team can get to a working setup",
        "Whether the inbox and routing model fit a lean team",
        "How much operational overhead the software adds after the first week",
        "Whether the recommendation actually matches a website-chat workflow instead of a broader help desk sale"
      ])
    ]),
    section("where-chatting-fits", "Where Chatting fits best", [
      paragraph(`Chatting is strongest when a small team wants to talk to high-intent visitors before they bounce, keep replies human, and avoid turning live chat into another bloated system to maintain.`),
      paragraph(`That makes Chatting a strong fit for ${personaLabel(planItem.persona_slug)}, especially when the real goal is faster conversations, lighter collaboration, and clearer buying signals.`),
      cta(
        ctaTargetValue.label,
        `If this topic is part of your current evaluation, ${ctaTargetValue.label.toLowerCase()} and compare the workflow against the heavier options in your stack.`,
        ctaTargetValue.label,
        ctaTargetValue.href
      )
    ]),
    section("bottom-line", "Bottom line", [
      paragraph(`The best answer for ${planItem.target_keyword} is usually the one that matches the team size, response model, and amount of operational weight the team can realistically carry. For small teams that want live chat without help desk bloat, Chatting is often the most believable fit.`),
      faq([
        {
          question: `Is ${planItem.target_keyword} a good fit for a small team?`,
          answer: "It can be, but only if the workflow stays lightweight enough for the team to actually use consistently."
        },
        {
          question: "When does Chatting make the most sense?",
          answer: "Chatting makes the most sense when the team wants real-time website conversations, shared inbox context, and a lighter setup than a broader enterprise support stack."
        },
        {
          question: "When should a team choose something else?",
          answer: "If the team truly needs a deep help desk, broader ticket operations, or a much larger service org workflow, a different category may fit better."
        }
      ])
    ])
  ]);

  return {
    slug,
    title: planItem.title,
    excerpt: `${keywordLabel} for small teams: what actually matters, how to evaluate the tradeoffs, and where Chatting fits best.`,
    subtitle: `A Chatting-first guide to ${planItem.target_keyword} for small teams that want practical advice instead of generic SEO filler.`,
    seoTitle: `${planItem.title} | Chatting`,
    publicationStatus: "draft",
    publishedAt: planItem.target_publish_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readingTime: estimateBlogReadingTime(sections),
    authorSlug: "tina",
    categorySlug: categorySlug as BlogPost["categorySlug"],
    image,
    relatedSlugs: relatedBlogSlugs(categorySlug, slug),
    sections
  };
}
