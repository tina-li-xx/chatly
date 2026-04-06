import type { AiAssistReplyEditLevel } from "@/lib/types";

export const AI_ASSIST_REPLY_DRAFT_FIELD = "aiAssistReplyDraft";

const LIGHT_EDIT_DISTANCE_THRESHOLD = 2;
const LIGHT_EDIT_DISTANCE_RATIO = 0.35;

export type AiAssistReplyUsage = {
  edited: boolean;
  editLevel: AiAssistReplyEditLevel | null;
};

function normalizeAiAssistReplyValue(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function replyTokens(value: string) {
  return normalizeAiAssistReplyValue(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function levenshteinDistance<T>(left: T[], right: T[]) {
  if (!left.length) {
    return right.length;
  }

  if (!right.length) {
    return left.length;
  }

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;

    for (let column = 1; column <= right.length; column += 1) {
      const carry = previous[column];
      previous[column] = left[row - 1] === right[column - 1]
        ? diagonal
        : Math.min(previous[column] + 1, previous[column - 1] + 1, diagonal + 1);
      diagonal = carry;
    }
  }

  return previous[right.length];
}

function classifyAiAssistReplyEditLevel(
  draft: string,
  nextContent: string
): AiAssistReplyEditLevel | null {
  if (draft === nextContent) {
    return null;
  }

  const draftTokens = replyTokens(draft);
  const nextTokens = replyTokens(nextContent);
  const maxTokenCount = Math.max(draftTokens.length, nextTokens.length);
  if (!maxTokenCount) {
    return null;
  }

  const distance = levenshteinDistance(draftTokens, nextTokens);
  return distance <= LIGHT_EDIT_DISTANCE_THRESHOLD ||
      distance / maxTokenCount <= LIGHT_EDIT_DISTANCE_RATIO
    ? "light"
    : "heavy";
}

export function readAiAssistReplyUsage(formData: FormData, content: string) {
  const draft = normalizeAiAssistReplyValue(
    String(formData.get(AI_ASSIST_REPLY_DRAFT_FIELD) ?? "")
  );
  const nextContent = normalizeAiAssistReplyValue(content);

  if (!draft || !nextContent) {
    return null;
  }

  const editLevel = classifyAiAssistReplyEditLevel(draft, nextContent);
  return {
    edited: editLevel != null,
    editLevel
  };
}

export function aiAssistReplyUsageEventDetail(
  editLevel: AiAssistReplyEditLevel | null | undefined
) {
  if (editLevel === undefined) {
    return null;
  }

  return {
    edited: editLevel != null,
    ...(editLevel ? { editLevel } : {})
  };
}

export function storedAiAssistReplyUsage(
  editLevel: AiAssistReplyEditLevel | null | undefined
) {
  if (editLevel === undefined) {
    return null;
  }

  return {
    edited: editLevel != null,
    editLevel
  };
}
