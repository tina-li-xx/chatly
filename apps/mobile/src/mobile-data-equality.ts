import type { ConversationSummary, ConversationThread } from "./types";

function sameJson(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function sameConversationList(
  current: ConversationSummary[],
  next: ConversationSummary[],
) {
  return sameJson(current, next);
}

export function sameConversationThread(
  current: ConversationThread | null,
  next: ConversationThread | null,
) {
  return sameJson(current, next);
}
