import { query } from "@/lib/db";

export type ToolExportRequestRow = {
  id: string;
  email: string;
  tool_slug: string;
  source: string;
  result_payload_json: unknown;
  delivery_sent_at: string | null;
  created_at: string;
};

export async function insertToolExportRequestRecord(input: {
  id: string;
  email: string;
  toolSlug: string;
  source: string;
  resultPayload: unknown;
}) {
  const result = await query<ToolExportRequestRow>(
    `
      INSERT INTO tool_export_requests (id, email, tool_slug, source, result_payload_json)
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING
        id,
        email,
        tool_slug,
        source,
        result_payload_json,
        delivery_sent_at,
        created_at
    `,
    [input.id, input.email, input.toolSlug, input.source, JSON.stringify(input.resultPayload ?? {})]
  );

  return result.rows[0];
}

export async function markToolExportRequestSent(id: string) {
  await query(
    `
      UPDATE tool_export_requests
      SET delivery_sent_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}
