import type { DashboardAutomationFaqEntry } from "@/lib/data/settings-types";

export type MatchedAutomationFaq = {
  id: string;
  question: string;
  answer: string;
  link: string;
  score: number;
};

function tokenizeSearch(value: string) {
  return value.trim().toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1);
}

export function scoreAutomationFaqMatch(value: string, search: string) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return 0;
  }

  const normalizedValue = value.toLowerCase();
  const tokens = tokenizeSearch(normalizedSearch);
  let score = normalizedValue.includes(normalizedSearch) ? 10 : 0;

  for (const token of tokens) {
    if (normalizedValue.includes(token)) {
      score += 1;
    }
  }

  return score;
}

export function matchAutomationFaqs(
  entries: DashboardAutomationFaqEntry[],
  search: string,
  options?: {
    limit?: number;
    includeAllWhenEmpty?: boolean;
  }
) {
  const normalizedSearch = search.trim().toLowerCase();
  const limit = options?.limit ?? 3;

  if (!normalizedSearch && !options?.includeAllWhenEmpty) {
    return [] as MatchedAutomationFaq[];
  }

  return entries
    .map((entry) => {
      const score = normalizedSearch
        ? scoreAutomationFaqMatch(`${entry.question} ${entry.keywords.join(" ")} ${entry.answer}`, normalizedSearch)
        : 1;

      return {
        id: entry.id,
        question: entry.question,
        answer: entry.answer,
        link: entry.link,
        score
      } satisfies MatchedAutomationFaq;
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.question.localeCompare(right.question))
    .slice(0, limit);
}
