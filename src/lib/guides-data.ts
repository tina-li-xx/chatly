import type { GuideArticle } from "@/lib/guide-article";
import { chattingApiReferenceGuide } from "@/lib/chatting-api-reference-guide";
import { chattingInboxShortcutsGuide } from "@/lib/chatting-inbox-shortcuts-guide";
import { chattingIosSdkGuide } from "@/lib/chatting-ios-sdk-guide";
import { chattingReactNativeExpoGuide } from "@/lib/chatting-react-native-expo-guide";
import { chattingZapierApiReferenceGuide } from "@/lib/chatting-zapier-api-reference-guide";
import { chattingShopifyIntegrationGuide } from "@/lib/chatting-shopify-integration-guide";
import { chattingSlackIntegrationGuide } from "@/lib/chatting-slack-integration-guide";
import { chattingZapierStarterZapsGuide } from "@/lib/chatting-zapier-starter-zaps-guide";
import { chattingWebhooksIntegrationGuide } from "@/lib/chatting-webhooks-integration-guide";
import { chattingZapierIntegrationGuide } from "@/lib/chatting-zapier-integration-guide";

const guides = [
  chattingApiReferenceGuide,
  chattingReactNativeExpoGuide,
  chattingIosSdkGuide,
  chattingInboxShortcutsGuide,
  chattingZapierApiReferenceGuide,
  chattingSlackIntegrationGuide,
  chattingZapierStarterZapsGuide,
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
