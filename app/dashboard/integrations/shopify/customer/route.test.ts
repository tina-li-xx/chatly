const mocks = vi.hoisted(() => ({
  fetchShopifyCustomerContext: vi.fn(),
  findWorkspaceIntegrationRow: vi.fn(),
  getInboxConversationSummaryById: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

vi.mock("@/lib/data", () => ({
  getInboxConversationSummaryById: mocks.getInboxConversationSummaryById
}));

vi.mock("@/lib/repositories/integrations-repository", () => ({
  findWorkspaceIntegrationRow: mocks.findWorkspaceIntegrationRow
}));

vi.mock("@/lib/shopify-customer-context", () => ({
  fetchShopifyCustomerContext: mocks.fetchShopifyCustomerContext
}));

import { encryptIntegrationCredentials } from "@/lib/integration-credentials";
import { GET } from "./route";

describe("dashboard shopify customer context route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_1",
        email: "owner@chatting.example",
        createdAt: "2026-04-07T00:00:00.000Z",
        workspaceOwnerId: "owner_1",
        workspaceRole: "admin"
      }
    });
  });

  it("returns null when no Shopify integration is connected", async () => {
    mocks.getInboxConversationSummaryById.mockResolvedValueOnce({
      id: "conv_1",
      email: "alex@example.com"
    });
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce(null);

    const response = await GET(
      new Request("http://localhost/dashboard/integrations/shopify/customer?conversationId=conv_1")
    );

    expect(await response.json()).toEqual({ ok: true, customer: null });
  });

  it("returns live customer context for a matched conversation email", async () => {
    mocks.getInboxConversationSummaryById.mockResolvedValueOnce({
      id: "conv_1",
      email: "alex@example.com"
    });
    mocks.findWorkspaceIntegrationRow.mockResolvedValueOnce({
      provider: "shopify",
      status: "connected",
      account_label: "acme-store.myshopify.com",
      external_account_id: "acme-store.myshopify.com",
      settings_json: JSON.stringify({ domain: "acme-store.myshopify.com" }),
      credentials_json: encryptIntegrationCredentials({
        accessToken: "shpat_live"
      }),
      error_message: null,
      connected_at: null,
      last_validated_at: null
    });
    mocks.fetchShopifyCustomerContext.mockResolvedValueOnce({
      displayName: "Alex Stone",
      customerSinceLabel: "Mar 2023",
      totalOrders: 7,
      totalSpentLabel: "$847.00",
      lastOrderLabel: "Mar 15, 2024",
      recentOrders: [],
      customerUrl: "https://acme-store.myshopify.com/admin/customers/123"
    });

    const response = await GET(
      new Request("http://localhost/dashboard/integrations/shopify/customer?conversationId=conv_1")
    );

    expect(mocks.fetchShopifyCustomerContext).toHaveBeenCalledWith({
      accessToken: "shpat_live",
      domain: "acme-store.myshopify.com",
      email: "alex@example.com"
    });
    expect(await response.json()).toMatchObject({
      ok: true,
      customer: {
        displayName: "Alex Stone",
        totalOrders: 7
      }
    });
  });
});
