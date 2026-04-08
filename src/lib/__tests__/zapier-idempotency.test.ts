const mocks = vi.hoisted(() => ({
  findWorkspaceZapierIdempotencyRow: vi.fn(),
  upsertWorkspaceZapierIdempotencyRow: vi.fn()
}));

vi.mock("@/lib/repositories/zapier-idempotency-repository", () => ({
  findWorkspaceZapierIdempotencyRow: mocks.findWorkspaceZapierIdempotencyRow,
  upsertWorkspaceZapierIdempotencyRow: mocks.upsertWorkspaceZapierIdempotencyRow
}));

import { createHash } from "node:crypto";
import { withZapierIdempotentJsonResponse } from "@/lib/zapier-idempotency";

describe("zapier idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes through when no idempotency key is provided", async () => {
    const execute = vi.fn().mockResolvedValue(
      Response.json({ ok: true }, { status: 201 })
    );

    const response = await withZapierIdempotentJsonResponse({
      request: new Request("https://chatting.test/api/zapier/contacts", {
        method: "POST"
      }),
      auth: {
        apiKeyId: "key_1",
        ownerUserId: "owner_1",
        ownerEmail: "owner@chatting.example",
        teamName: "Chatting"
      },
      requestBody: { route: "contacts.create" },
      execute
    });

    expect(execute).toHaveBeenCalledTimes(1);
    expect(mocks.upsertWorkspaceZapierIdempotencyRow).not.toHaveBeenCalled();
    expect(response.status).toBe(201);
  });

  it("replays stored json responses for matching idempotency keys", async () => {
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ route: "contacts.create" }))
      .digest("hex");
    mocks.findWorkspaceZapierIdempotencyRow.mockResolvedValueOnce({
      request_hash: requestHash,
      response_status: 201,
      response_json: "{\"ok\":true,\"id\":\"contact_1\"}"
    });

    const response = await withZapierIdempotentJsonResponse({
      request: new Request("https://chatting.test/api/zapier/contacts", {
        method: "POST",
        headers: { "Idempotency-Key": "idem_1" }
      }),
      auth: {
        apiKeyId: "key_1",
        ownerUserId: "owner_1",
        ownerEmail: "owner@chatting.example",
        teamName: "Chatting"
      },
      requestBody: { route: "contacts.create" },
      execute: vi.fn()
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, id: "contact_1" });
  });

  it("stores the first successful json response", async () => {
    mocks.findWorkspaceZapierIdempotencyRow.mockResolvedValueOnce(null);
    const execute = vi.fn().mockResolvedValue(
      Response.json({ ok: true, id: "contact_1" }, { status: 201 })
    );

    await withZapierIdempotentJsonResponse({
      request: new Request("https://chatting.test/api/zapier/contacts", {
        method: "POST",
        headers: { "Idempotency-Key": "idem_1" }
      }),
      auth: {
        apiKeyId: "key_1",
        ownerUserId: "owner_1",
        ownerEmail: "owner@chatting.example",
        teamName: "Chatting"
      },
      requestBody: { route: "contacts.create" },
      execute
    });

    expect(mocks.upsertWorkspaceZapierIdempotencyRow).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKeyId: "key_1",
        idempotencyKey: "idem_1",
        responseStatus: 201
      })
    );
  });
});
