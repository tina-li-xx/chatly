import type { GuideArticle } from "@/lib/guide-article";
import { chattingInboxShortcutsGuide } from "@/lib/chatting-inbox-shortcuts-guide";
import { chattingShopifyIntegrationGuide } from "@/lib/chatting-shopify-integration-guide";
import { chattingSlackIntegrationGuide } from "@/lib/chatting-slack-integration-guide";
import { chattingWebhooksIntegrationGuide } from "@/lib/chatting-webhooks-integration-guide";
import { chattingZapierIntegrationGuide } from "@/lib/chatting-zapier-integration-guide";

const guides = [
  chattingInboxShortcutsGuide,
  chattingSlackIntegrationGuide,
  chattingZapierIntegrationGuide,
  chattingShopifyIntegrationGuide,
  chattingWebhooksIntegrationGuide
] as const satisfies readonly GuideArticle[];

export function getAllGuides(): GuideArticle[] {
  return [...guides].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
}

export function getGuideBySlug(slug: string): GuideArticle | null {
  return guides.find((guide) => guide.slug === slug) ?? null;
}

export function getFeaturedGuide(): GuideArticle {
  return getAllGuides()[0];
}
