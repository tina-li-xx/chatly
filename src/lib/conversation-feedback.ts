import type { ConversationRating } from "@/lib/types";

export type ConversationFeedbackLink = {
  rating: ConversationRating;
  label: string;
  href: string;
};

const CONVERSATION_RATINGS = [1, 2, 3, 4, 5] as const satisfies ConversationRating[];

export function parseConversationRating(value: unknown): ConversationRating | null {
  const normalized =
    typeof value === "string"
      ? Number(value.trim())
      : typeof value === "number"
        ? value
        : Number.NaN;

  return CONVERSATION_RATINGS.includes(normalized as ConversationRating)
    ? (normalized as ConversationRating)
    : null;
}

export function formatConversationRatingLabel(rating: ConversationRating) {
  return `${rating} star${rating === 1 ? "" : "s"}`;
}

export function buildConversationFeedbackLinks(appUrl: string, conversationId: string): ConversationFeedbackLink[] {
  const encodedConversationId = encodeURIComponent(conversationId);

  return CONVERSATION_RATINGS.map((rating) => ({
    rating,
    label: formatConversationRatingLabel(rating),
    href: `${appUrl}/feedback?conversationId=${encodedConversationId}&rating=${rating}`
  }));
}

export function ratingScoreToPercent(score: number | null) {
  return score == null || Number.isNaN(score) ? null : Math.round((score / 5) * 100);
}
