const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  exchangeShopifyOAuthCode: vi.fn(),
  findWorkspaceIntegrationRow: vi.fn(),
  getCurrentUser: vi.fn(),
  getShopifyOAuthCookieOptions: vi.fn(() => ({ path: "/", httpOnly: true })),
  getWorkspaceAccess: vi.fn(),
  integrationPopupErrorResponse: vi.fn((message: string) =>
    new Response(message, { status: 400 })
  ),
  integrationPopupSuccessResponse: vi.fn((detail: Record<string, unknown>) =>
    Response.json(detail)
  ),
  parseShopifyOAuthStateCookie: vi.fn(() => ({
    state: "state_123",
    ownerUserId: "owner_1",
    shop: "acme-store.myshopify.com"
  })),
  upsertWorkspaceIntegrationRow: vi.fn(),
  verifyShopifyOAuthQuery: vi.fn(() => true)
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));
vi.mock("@/lib/integration-popup-response", () => ({
  integrationPopupErrorResponse: mocks.integrationPopupErrorResponse,
  integrationPopupSuccessResponse: mocks.integrationPopupSuccessResponse
}));
vi.mock("@/lib/shopify-integration", () => ({
  exchangeShopifyOAuthCode: mocks.exchangeShopifyOAuthCode,
  getShopifyOAuthCookieOptions: mocks.getShopifyOAuthCookieOptions,
  normalizeShopifyShopDomain: (value: string | null) => value,
  parseShopifyOAuthStateCookie: mocks.parseShopifyOAuthStateCookie,
  SHOPIFY_OAUTH_STATE_COOKIE: "chatting_shopify_oauth_state",
  verifyShopifyOAuthQuery: mocks.verifyShopifyOAuthQuery
}));
vi.mock("@/lib/repositories/integrations-repository", () => ({
  findWorkspaceIntegrationRow: mocks.findWorkspaceIntegrationRow,
  upsertWorkspaceIntegrationRow: mocks.upsertWorkspaceIntegrationRow
}));

import { GET } from "./route";

describe("shopify oauth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({
      get: vi.fn(() => ({
        value: JSON.stringify({
          state: "state_123",
          ownerUserId: "owner_1",
          shop: "acme-store.myshopify.com"
        })
      })),
      set: vi.fn()
    });
  });

  it("rejects invalid oauth state", async () => {
    mocks.verifyShopifyOAuthQuery.mockReturnValueOnce(false);

    const response = await GET(
      new Request(
        "http://localhost/api/integrations/shopify/callback?code=code_123&shop=acme-store.myshopify.com&state=state_123"
      )
    );

    expect(mocks.integrationPopupErrorResponse).toHaveBeenCalledWith(
      "Shopify OAuth state verification failed. Please try again.",
      "shopify"
    );
    expect(response.status).toBe(400);
  });

  it("exchanges the shopify code and stores the workspace connection", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce({
      id: "user_1",
      workspaceRole: "admin"
    });
    mocks.getWorkspaceAccess.mockResolvedValueOnce({ ownerUserId: "owner_1" });
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce(null);
    mocks.exchangeShopifyOAuthCode.mockResolvedValueOnce({
      accessToken: "shpat_live",
      scopes: ["read_customers", "read_orders"]
    });

    await GET(
      new Request(
        "http://localhost/api/integrations/shopify/callback?code=code_123&shop=acme-store.myshopify.com&state=state_123&hmac=ok"
      )
    );

    expect(mocks.exchangeShopifyOAuthCode).toHaveBeenCalledWith(
      "acme-store.myshopify.com",
      "code_123"
    );
    expect(mocks.upsertWorkspaceIntegrationRow).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        provider: "shopify",
        accountLabel: "acme-store.myshopify.com",
        externalAccountId: "acme-store.myshopify.com",
        status: "connected"
      })
    );
    expect(mocks.integrationPopupSuccessResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "shopify",
        outcome: "success",
        domain: "acme-store.myshopify.com"
      })
    );
  });
});
