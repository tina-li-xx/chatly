import "server-only";

import type { ChattingSeoLiveSearchResult } from "@/lib/chatting-seo-live-research-types";

const CHATTING_DOMAIN = "usechatting.com";

function competitorNeedles(slug: string, name: string) {
  const normalizedSlug = slug.replace(/-chat$/, "").replace(/-/g, " ").trim();
  const tokens = [slug, normalizedSlug, name].flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean));
  return [...new Set(tokens.filter((token) => token.length > 2 && token !== "generic"))];
}

export function matchesChatting(result: ChattingSeoLiveSearchResult) {
  return result.domain.includes(CHATTING_DOMAIN) || /\bchatting\b/i.test(`${result.title} ${result.snippet}`);
}

export function matchesCompetitor(result: ChattingSeoLiveSearchResult, slug: string, name: string) {
  const haystack = `${result.domain} ${result.title} ${result.snippet}`.toLowerCase();
  return competitorNeedles(slug, name).some((needle) => haystack.includes(needle));
}

export function contentPatternForResult(result: ChattingSeoLiveSearchResult) {
  const haystack = `${result.url} ${result.title} ${result.snippet}`.toLowerCase();
  if (/calculator|checker|template|generator|tool/.test(haystack)) return "tool";
  if (/pricing|cost|quote/.test(haystack)) return "pricing";
  if (/alternative| vs |compare|comparison/.test(haystack)) return "comparison";
  if (/docs|documentation|help|support/.test(haystack)) return "docs";
  if (/features|widget|inbox|routing|saved replies/.test(haystack)) return "feature";

  try {
    const url = new URL(result.url);
    if (url.pathname === "/" || !url.pathname.replace(/\//g, "")) return "homepage";
  } catch {}

  return "article";
}
