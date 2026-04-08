const mocks = vi.hoisted(() => ({
  findWorkspaceAccessRow: vi.fn(),
  listActiveWorkspaceZapierApiKeyRowsByPrefix: vi.fn(),
  markWorkspaceZapierApiKeyUsed: vi.fn()
}));

vi.mock("@/lib/repositories/workspace-access-repository", () => ({
  findWorkspaceAccessRow: mocks.findWorkspaceAccessRow
}));
vi.mock("@/lib/repositories/zapier-api-keys-repository", () => ({
  findActiveWorkspaceZapierApiKeyRow: vi.fn(),
  listActiveWorkspaceZapierApiKeyRowsByPrefix:
    mocks.listActiveWorkspaceZapierApiKeyRowsByPrefix,
  markWorkspaceZapierApiKeyUsed: mocks.markWorkspaceZapierApiKeyUsed
}));

import { hashZapierApiKey } from "@/lib/zapier-integration";
import { requireZapierApiAuth } from "@/lib/zapier-api-auth";

describe("zapier api auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findWorkspaceAccessRow.mockResolvedValue({
      owner_email: "owner@chatting.example",
      team_name: "Chatting"
    });
    mocks.markWorkspaceZapierApiKeyUsed.mockResolvedValue({});
  });

  it("rejects missing API keys", async () => {
    const result = await requireZapierApiAuth(
      new Request("https://chatting.test/api/zapier/me")
    );

    expect("response" in result && result.response.status).toBe(401);
  });

  it("authenticates valid API keys and marks them used", async () => {
    const apiKey = "ck_live_1234567890abcdef1234567890abcdef";
    const hashed = hashZapierApiKey(apiKey);
    mocks.listActiveWorkspaceZapierApiKeyRowsByPrefix.mockResolvedValueOnce([
      {
        id: "key_1",
        owner_user_id: "owner_1",
        key_hash: hashed.keyHash,
        key_salt: hashed.keySalt
      }
    ]);

    const result = await requireZapierApiAuth(
      new Request("https://chatting.test/api/zapier/me", {
        headers: { "x-api-key": apiKey }
      })
    );

    expect("auth" in result && result.auth).toMatchObject({
      apiKeyId: "key_1",
      ownerUserId: "owner_1",
      teamName: "Chatting"
    });
    expect(mocks.markWorkspaceZapierApiKeyUsed).toHaveBeenCalledWith({
      id: "key_1",
      ownerUserId: "owner_1"
    });
  });
});
