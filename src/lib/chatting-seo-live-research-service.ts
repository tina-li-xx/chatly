import "server-only";

import { getOptionalServerEnv } from "@/lib/env.server";
import type { ChattingSeoLiveResearchProvider, ChattingSeoLiveSearchResult } from "@/lib/chatting-seo-live-research-types";

const SEARXNG_BASE_URL = getOptionalServerEnv("SEARXNG_BASE_URL");
const BING_SEARCH_ENDPOINT = "https://www.bing.com/search";
const DUCKDUCKGO_HTML_ENDPOINT = "https://html.duckduckgo.com/html/";

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/");
}

function stripTags(value: string) {
  return decodeXml(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function readTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] ? stripTags(match[1]) : "";
}

function extractDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function parseBingRssResults(xml: string, limit = 5): ChattingSeoLiveSearchResult[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((match) => match[1] ?? "")
    .map((block, index) => {
      const url = readTag(block, "link");

      return {
        rank: index + 1,
        title: readTag(block, "title"),
        url,
        domain: extractDomain(url),
        snippet: readTag(block, "description")
      } satisfies ChattingSeoLiveSearchResult;
    })
    .filter((item) => item.title && item.url);

  return items.slice(0, limit);
}

export function parseSearxngJsonResults(payload: unknown, limit = 5): ChattingSeoLiveSearchResult[] {
  const results = payload && typeof payload === "object" && Array.isArray((payload as { results?: unknown[] }).results)
    ? (payload as { results: unknown[] }).results
    : [];

  return results
    .map((entry) => (entry && typeof entry === "object" ? entry as Record<string, unknown> : {}))
    .map((entry, index) => {
      const url = typeof entry.url === "string" ? entry.url.trim() : "";
      const title = typeof entry.title === "string" ? entry.title.trim() : "";
      const snippet = typeof entry.content === "string" ? stripTags(entry.content) : "";

      return {
        rank: index + 1,
        title,
        url,
        domain: extractDomain(url),
        snippet
      } satisfies ChattingSeoLiveSearchResult;
    })
    .filter((item) => item.title && item.url)
    .slice(0, limit);
}

function resolveDuckDuckGoUrl(url: string) {
  const decoded = decodeXml(url);

  try {
    const parsed = new URL(decoded, "https://duckduckgo.com");
    const target = parsed.searchParams.get("uddg");
    return target || parsed.toString();
  } catch {
    return decoded;
  }
}

export function parseDuckDuckGoHtmlResults(html: string, limit = 5): ChattingSeoLiveSearchResult[] {
  return [...html.matchAll(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match, index) => {
      const url = resolveDuckDuckGoUrl(match[1] ?? "");
      const nearbyHtml = html.slice(match.index ?? 0, (match.index ?? 0) + 2000);
      const snippetMatch =
        nearbyHtml.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ??
        nearbyHtml.match(/<div[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

      return {
        rank: index + 1,
        title: stripTags(match[2] ?? ""),
        url,
        domain: extractDomain(url),
        snippet: stripTags(snippetMatch?.[1] ?? "")
      } satisfies ChattingSeoLiveSearchResult;
    })
    .filter((item) => item.title && item.url)
    .slice(0, limit);
}

async function fetchSearchText(url: string, accept: string) {
  const response = await fetch(url, {
    headers: {
      accept,
      "user-agent": "Mozilla/5.0 (compatible; ChattingSeoResearch/1.0; +https://usechatting.com)"
    },
    next: { revalidate: 60 * 60 }
  });

  if (!response.ok) {
    throw new Error("CHATTING_SEO_RESEARCH_SEARCH_FAILED");
  }

  return response.text();
}

async function fetchSearchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (compatible; ChattingSeoResearch/1.0; +https://usechatting.com)"
    },
    next: { revalidate: 60 * 60 }
  });

  if (!response.ok) {
    throw new Error("CHATTING_SEO_RESEARCH_SEARCH_FAILED");
  }

  return response.json();
}

async function searchSearxng(query: string, limit = 5) {
  if (!SEARXNG_BASE_URL) {
    throw new Error("SEARXNG_NOT_CONFIGURED");
  }

  const url = new URL("/search", SEARXNG_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("language", "en-GB");
  url.searchParams.set("safesearch", "0");

  return {
    provider: "searxng-json" as const,
    results: parseSearxngJsonResults(await fetchSearchJson(url.toString()), limit)
  };
}

async function searchBingRss(query: string, limit = 5) {
  const url = new URL(BING_SEARCH_ENDPOINT);
  url.searchParams.set("format", "rss");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(limit));
  url.searchParams.set("setlang", "en-GB");

  return {
    provider: "bing-rss" as const,
    results: parseBingRssResults(await fetchSearchText(url.toString(), "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8"), limit)
  };
}

async function searchDuckDuckGoHtml(query: string, limit = 5) {
  const url = new URL(DUCKDUCKGO_HTML_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("kl", "uk-en");

  return {
    provider: "duckduckgo-html" as const,
    results: parseDuckDuckGoHtmlResults(await fetchSearchText(url.toString(), "text/html,application/xhtml+xml"), limit)
  };
}

export async function searchLiveSearchResults(query: string, limit = 5): Promise<{
  provider: ChattingSeoLiveResearchProvider;
  results: ChattingSeoLiveSearchResult[];
}> {
  for (const search of [searchSearxng, searchBingRss, searchDuckDuckGoHtml]) {
    try {
      const response = await search(query, limit);
      if (response.results.length) return response;
    } catch {}
  }

  throw new Error("CHATTING_SEO_RESEARCH_SEARCH_FAILED");
}
