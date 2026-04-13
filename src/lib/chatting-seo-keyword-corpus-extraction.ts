import "server-only";

const KEYWORD_TERMS = [
  "live chat",
  "chat widget",
  "website chat",
  "shared inbox",
  "help desk",
  "customer support",
  "visitor tracking",
  "proactive chat",
  "saved replies",
  "offline chat",
  "chat routing",
  "intercom alternative",
  "zendesk alternative",
  "gorgias alternative",
  "chatwoot alternative"
];

function cleanedSegment(value: string) {
  return value
    .replace(/\([^)]*\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\bwww\.[^\s]+\b/gi, " ")
    .replace(/[^a-z0-9+\s/-]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleSegment(value: string) {
  return value
    .split(/\s[|–—-]\s|:/g)
    .map((segment) => cleanedSegment(segment))
    .find((segment) => segment.split(/\s+/).length >= 2) ?? "";
}

function interestingPhrase(value: string) {
  const words = value.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 8) return false;
  if (value.length < 10 || value.length > 80) return false;
  return KEYWORD_TERMS.some((term) => value.toLowerCase().includes(term) || term.includes(value.toLowerCase()));
}

function sentencePhrases(value: string) {
  const normalized = cleanedSegment(value).toLowerCase();
  return KEYWORD_TERMS.flatMap((term) => {
    const index = normalized.indexOf(term);
    if (index < 0) return [];
    const tail = normalized.slice(index, index + 60).replace(/\s+/g, " ").trim();
    const phrase = tail.split(/[.,;!?]/)[0]?.trim() ?? "";
    return interestingPhrase(phrase) ? [phrase] : [];
  });
}

export function normalizeKeyword(value: string) {
  return cleanedSegment(value).toLowerCase();
}

export function suggestedKeywordTitle(value: string) {
  return normalizeKeyword(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => (part === "vs" ? "vs" : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(" ");
}

export function extractKeywordIdeas(input: { title: string; snippet: string }) {
  const ideas = [
    titleSegment(input.title),
    ...sentencePhrases(input.title),
    ...sentencePhrases(input.snippet)
  ]
    .map((phrase) => normalizeKeyword(phrase))
    .filter(Boolean);

  return [...new Set(ideas)].slice(0, 4);
}
