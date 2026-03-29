import { randomUUID } from "node:crypto";
import { isSupportedFreeToolExportSlug, sendFreeToolExportEmail } from "@/lib/free-tool-export-email";
import {
  insertToolExportRequestRecord,
  markToolExportRequestSent
} from "@/lib/repositories/free-tool-export-repository";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function requestFreeToolExport(input: {
  email: string;
  toolSlug: string;
  source: string;
  resultPayload: unknown;
}) {
  const email = normalizeEmail(input.email);
  const source = input.source.trim() || "free-tools";
  const toolSlug = input.toolSlug.trim();

  if (!email) {
    throw new Error("MISSING_EMAIL");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("INVALID_EMAIL");
  }

  if (!toolSlug) {
    throw new Error("INVALID_TOOL_EXPORT");
  }

  if (!isSupportedFreeToolExportSlug(toolSlug)) {
    throw new Error("UNSUPPORTED_TOOL_EXPORT");
  }

  const request = await insertToolExportRequestRecord({
    id: randomUUID(),
    email,
    toolSlug,
    source,
    resultPayload: input.resultPayload ?? {}
  });

  try {
    await sendFreeToolExportEmail({
      email,
      toolSlug,
      resultPayload: input.resultPayload ?? {}
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNSUPPORTED_TOOL_EXPORT") {
      throw error;
    }

    throw new Error("FREE_TOOL_EXPORT_DELIVERY_FAILED");
  }

  await markToolExportRequestSent(request.id);

  return { ok: true };
}
