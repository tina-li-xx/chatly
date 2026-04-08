import "server-only";

import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/route-helpers";
import type { ZapierApiAuthContext } from "@/lib/zapier-api-auth";
import {
  findWorkspaceZapierIdempotencyRow,
  upsertWorkspaceZapierIdempotencyRow
} from "@/lib/repositories/zapier-idempotency-repository";

function buildRequestHash(value: Record<string, unknown>) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readIdempotencyKey(request: Request) {
  return (
    request.headers.get("idempotency-key")?.trim() ||
    request.headers.get("x-idempotency-key")?.trim() ||
    ""
  );
}

export async function withZapierIdempotentJsonResponse(input: {
  request: Request;
  auth: ZapierApiAuthContext;
  requestBody: Record<string, unknown>;
  execute: () => Promise<Response>;
}) {
  const idempotencyKey = readIdempotencyKey(input.request);
  if (!idempotencyKey) {
    return input.execute();
  }

  const requestHash = buildRequestHash(input.requestBody);
  const existing = await findWorkspaceZapierIdempotencyRow({
    apiKeyId: input.auth.apiKeyId,
    idempotencyKey
  });

  if (existing) {
    if (existing.request_hash !== requestHash) {
      return jsonError("idempotency-key-conflict", 409);
    }

    return new NextResponse(existing.response_json, {
      status: existing.response_status,
      headers: {
        "content-type": "application/json"
      }
    });
  }

  const response = await input.execute();
  const responseJson = await response.clone().text();

  await upsertWorkspaceZapierIdempotencyRow({
    apiKeyId: input.auth.apiKeyId,
    ownerUserId: input.auth.ownerUserId,
    idempotencyKey,
    requestHash,
    responseStatus: response.status,
    responseJson
  });

  return response;
}
