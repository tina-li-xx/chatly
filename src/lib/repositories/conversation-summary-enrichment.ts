import { query } from "@/lib/db";
import type { SummaryRow } from "./shared-conversation-select";

type ConversationTagRow = {
  conversation_id: string;
  tags: string[] | null;
};

type ConversationRatingRow = {
  conversation_id: string;
  rating: number | null;
};

export async function enrichConversationSummaryRows(rows: SummaryRow[]) {
  const conversationIds = Array.from(new Set(rows.map((row) => row.id).filter(Boolean)));
  if (!conversationIds.length) {
    return rows;
  }

  try {
    const [tagResult, ratingResult] = await Promise.all([
      query<ConversationTagRow>(
        `
          SELECT conversation_id, ARRAY_AGG(tag ORDER BY tag) AS tags
          FROM tags
          WHERE conversation_id = ANY($1::text[])
          GROUP BY conversation_id
        `,
        [conversationIds]
      ),
      query<ConversationRatingRow>(
        `
          SELECT conversation_id, rating
          FROM feedback
          WHERE conversation_id = ANY($1::text[])
        `,
        [conversationIds]
      )
    ]);

    const tagsByConversationId = new Map(
      tagResult.rows.map((row) => [row.conversation_id, row.tags ?? []] as const)
    );
    const ratingsByConversationId = new Map(
      ratingResult.rows.map((row) => [row.conversation_id, row.rating] as const)
    );

    return rows.map((row) => ({
      ...row,
      tags: tagsByConversationId.get(row.id) ?? row.tags ?? [],
      rating: ratingsByConversationId.get(row.id) ?? row.rating ?? null
    }));
  } catch {
    return rows;
  }
}
