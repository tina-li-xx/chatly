import "server-only";

import { randomUUID } from "node:crypto";
import type { ChattingSeoProfile } from "@/lib/chatting-seo-profile";
import { generatedBlogPosts } from "@/lib/generated-blog-posts";
import type { ReplaceSeoPlanItemInput } from "@/lib/repositories/seo-pipeline-repository-shared";

type SeedBlueprint = readonly [string, string, string, string, string, string, string];

const BASE_BLUEPRINTS: SeedBlueprint[] = [
  ["Best website chat widget for small teams", "website chat widget for small teams", "small-teams", "commercial", "founders", "start-free", "Matches Chatting's core positioning around small-team live chat."],
  ["Shared inbox for website chat conversations", "shared inbox for website chat", "product", "commercial", "support-leads", "start-free", "Speaks directly to teams replacing scattered inbox workflows."],
  ["Proactive chat prompts for small teams", "proactive chat prompts", "how-to-guides", "informational", "growth-leads", "read-guides", "Highlights one of Chatting's strongest conversion-focused workflows."],
  ["Saved replies for live chat teams", "saved replies for live chat", "product", "informational", "support-leads", "start-free", "Turns a real shipped feature into a practical content angle."],
  ["Visitor tracking for website chat teams", "visitor tracking for live chat", "live-chat-tips", "commercial", "founders", "start-free", "Connects the widget to the live visitor context Chatting already provides."],
  ["Live chat routing rules for lean teams", "live chat routing rules", "how-to-guides", "informational", "ops-leads", "read-guides", "Fits the lightweight automation and routing story in the product."],
  ["Reply-by-email after live chat", "reply by email after live chat", "product", "informational", "support-leads", "start-free", "Covers a real handoff path that matters to small teams."],
  ["Offline chat setup that still captures leads", "offline chat lead capture", "conversion", "commercial", "growth-leads", "start-free", "Talks to teams that cannot staff chat 24/7 but still need inbound leads."],
  ["Away messages that still turn into replies", "away message for live chat", "conversion", "informational", "support-leads", "read-guides", "Maps to customizable away and offline messaging already in Chatting."],
  ["Live chat analytics for small teams", "live chat analytics for small teams", "live-chat-tips", "commercial", "founders", "see-pricing", "Turns the analytics surface into a buyer-intent topic."],
  ["High-intent pages to watch in live chat", "high intent pages live chat", "conversion", "informational", "growth-leads", "read-guides", "Matches Chatting's positioning around talking to visitors before they bounce."],
  ["How to qualify website leads in live chat", "qualify leads in live chat", "conversion", "informational", "sales-leads", "read-guides", "Strong fit for human-first sales conversations on the site."],
  ["Pricing page live chat playbook", "pricing page live chat", "conversion", "commercial", "founders", "start-free", "Ties directly to post-click hesitation and pricing-page conversion work."],
  ["Demo request live chat playbook", "live chat for demo requests", "conversion", "commercial", "sales-leads", "start-free", "Useful for teams trying to capture in-the-moment buyer questions."],
  ["Live chat for founder-led SaaS", "live chat for saas founders", "small-teams", "commercial", "founders", "see-pricing", "A clear ICP-aligned topic for Chatting's buyer profile."],
  ["Live chat for agencies", "live chat for agencies", "small-teams", "commercial", "agencies", "see-pricing", "Broadens coverage into another believable small-team segment."],
  ["Live chat for consultancies", "live chat for consultancies", "small-teams", "commercial", "consultancies", "see-pricing", "Targets service businesses that still care about high-intent website conversations."],
  ["Live chat for ecommerce brands without a 24/7 team", "ecommerce live chat without 24 7 support", "small-teams", "commercial", "ecommerce-operators", "see-pricing", "Strong fit for smaller ecommerce teams and after-hours workflows."],
  ["How to hand off live conversations between teammates", "handoff live chat conversations", "how-to-guides", "informational", "support-leads", "read-guides", "Matches the shared inbox and assignment story without pretending to be enterprise."],
  ["Visitor notes for shared inbox teams", "visitor notes shared inbox", "product", "informational", "support-leads", "start-free", "Covers a real teamwork feature that helps small teams stay aligned."],
  ["White-label chat widget for client sites", "white label chat widget", "product", "commercial", "agencies", "see-pricing", "Aligns with the Growth plan's white-label widget positioning."],
  ["FAQ suggestions for small teams", "faq suggestions live chat", "product", "commercial", "support-leads", "see-pricing", "Connects to the FAQ suggestion flow already in the widget."],
  ["AI reply assist for human-first support", "ai reply assist for live chat", "product", "commercial", "support-leads", "see-pricing", "Frames AI assist the way Chatting positions it: helper, not replacement."],
  ["Help center articles teams can link from chat", "help center articles from live chat", "how-to-guides", "informational", "support-leads", "read-guides", "Fits the help-center-lite product surface without overclaiming."],
  ["Website live chat without a full CRM", "live chat without crm", "comparisons", "commercial", "founders", "see-pricing", "Directly answers the anti-bloat positioning in the product context."],
  ["HubSpot chat alternatives for small teams", "hubspot chat alternative", "comparisons", "commercial", "founders", "see-pricing", "Uses an approved competitor angle that is not already covered in the blog."],
  ["Chatting vs HubSpot Chat", "chatting vs hubspot chat", "comparisons", "commercial", "founders", "see-pricing", "Builds a direct comparison against a believable buyer alternative."],
  ["Simple live chat vs generic chat plugins", "simple live chat vs chat plugins", "comparisons", "commercial", "founders", "see-pricing", "Reinforces the gap between Chatting and barebones widgets."],
  ["Best small-team chat software without seat-pricing stress", "small team chat software pricing", "small-teams", "commercial", "founders", "see-pricing", "Leans into one of Chatting's strongest market objections."],
  ["Live chat for startup pricing objections", "live chat pricing objections", "conversion", "informational", "sales-leads", "read-guides", "Useful for teams trying to rescue hesitant buyers on key pages."],
  ["Post-click hesitation playbook for website teams", "post click hesitation website", "conversion", "informational", "growth-leads", "read-guides", "Matches the product story around in-the-moment questions and hesitation."],
  ["How many teammates really need inbox access?", "how many teammates need shared inbox access", "small-teams", "informational", "ops-leads", "see-pricing", "Fits the plan and seat conversation without bloating the message."],
  ["Human-first live chat vs AI chatbot-first support", "human live chat vs ai chatbot", "comparisons", "commercial", "founders", "see-pricing", "Lines up with the explicit human-in-the-loop positioning."],
  ["Convert more pricing-page traffic with live chat", "convert pricing page traffic with live chat", "conversion", "commercial", "growth-leads", "start-free", "Another strong buyer-intent angle around the pricing page."],
  ["Website chat widget with custom branding", "custom branded chat widget", "product", "commercial", "founders", "start-free", "Uses a shipped widget customization surface teams already care about."],
  ["Response-time playbook for small support teams", "response time for small support teams", "small-teams", "informational", "support-leads", "read-guides", "A durable operational topic with strong small-team relevance."],
  ["Live chat for high-ticket services", "live chat for service businesses", "small-teams", "commercial", "consultancies", "start-free", "Expands Chatting into service-led businesses without leaving the core use case."],
  ["Routing website chats without enterprise support software", "live chat routing without enterprise software", "comparisons", "commercial", "ops-leads", "see-pricing", "Answers a common stack objection without positioning Chatting as enterprise help desk software."],
  ["Conversation tags and notes for small support teams", "conversation tags and notes", "product", "informational", "support-leads", "start-free", "Turns lightweight collaboration features into a practical content angle."],
  ["Visitor context without a full help desk", "visitor context without help desk", "comparisons", "commercial", "founders", "see-pricing", "Reinforces the visitor-context story against bloated support stacks."]
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function targetPublishAt(position: number) {
  const date = new Date();
  date.setUTCHours(9, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + position + 1);
  return date.toISOString();
}

export function buildChattingSeoSeedPlanItems(profile: ChattingSeoProfile): ReplaceSeoPlanItemInput[] {
  const allowedCategories = new Set(profile.contentInventory.blogCategories.map((entry) => entry.slug));
  const allowedCtas = new Set(profile.ctas.map((entry) => entry.id));
  const existingContent = new Set(generatedBlogPosts.flatMap((post) => [slugify(post.slug), slugify(post.title)]));
  const seen = new Set<string>();
  const items = BASE_BLUEPRINTS
    .filter(([, keyword, categorySlug]) => allowedCategories.has(categorySlug) && !existingContent.has(slugify(keyword)))
    .filter(([title]) => {
      const key = slugify(title);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 30)
    .map(([title, keyword, categorySlug, searchIntent, personaSlug, ctaId, rationale], index) => ({
      id: `seo_item_${randomUUID()}`,
      position: index + 1,
      status: "planned" as const,
      targetPublishAt: targetPublishAt(index),
      title,
      targetKeyword: keyword,
      keywordCluster: keyword,
      searchIntent,
      contentFormat: "article",
      personaSlug,
      themeSlug: categorySlug,
      categorySlug,
      ctaId: allowedCtas.has(ctaId) ? ctaId : profile.ctas[0]?.id ?? "",
      priorityScore: 100 - index,
      rationale,
      notes: "Auto-seeded from the Chatting SEO profile on first publishing-dashboard load.",
      metadataJson: { source: "auto-bootstrap", seededAutomatically: true }
    }));

  if (items.length < 30) {
    throw new Error("CHATTING_SEO_SEED_UNDERFLOW");
  }

  return items;
}
