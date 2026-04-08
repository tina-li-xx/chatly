const mocks = vi.hoisted(() => ({
  buildShopifyAuthorizeUrl: vi.fn(),
  cookies: vi.fn(),
  getCurrentUser: vi.fn(),
  getShopifyOAuthCookieOptions: vi.fn(() => ({ path: "/", httpOnly: true })),
  redirect303: vi.fn(),
  serializeShopifyOAuthStateCookie: vi.fn(() => "{\"state\":\"state_123\"}")
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/route-helpers", () => ({ redirect303: mocks.redirect303 }));
vi.mock("@/lib/shopify-integration", () => ({
  buildShopifyAuthorizeUrl: mocks.buildShopifyAuthorizeUrl,
  getShopifyOAuthCookieOptions: mocks.getShopifyOAuthCookieOptions,
  normalizeShopifyShopDomain: (value: string | null) => value,
  serializeShopifyOAuthStateCookie: mocks.serializeShopifyOAuthStateCookie,
  SHOPIFY_OAUTH_STATE_COOKIE: "chatting_shopify_oauth_state"
}));

import { GET } from "./route";

describe("shopify oauth start route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({ set: vi.fn() });
    mocks.buildShopifyAuthorizeUrl.mockReturnValue("https://acme-store.myshopify.com/admin/oauth/authorize?client_id=123");
    mocks.redirect303.mockReturnValue(Response.redirect("http://localhost/login", 303));
  });

  it("redirects unauthenticated users to login", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce(null);

    const response = await GET(
      new Request("http://localhost/api/integrations/shopify/start?shop=acme-store.myshopify.com")
    );

    expect(mocks.redirect303).toHaveBeenCalledWith(expect.any(Request), "/login");
    expect(response.status).toBe(303);
  });

  it("rejects missing or invalid shop domains", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce({
      workspaceOwnerId: "owner_1",
      workspaceRole: "admin"
    });

    const response = await GET(
      new Request("http://localhost/api/integrations/shopify/start")
    );

    expect(response.headers.get("content-type")).toContain("text/html");
  });

  it("stores oauth state and redirects to Shopify", async () => {
    const cookieStore = { set: vi.fn() };
    mocks.cookies.mockResolvedValueOnce(cookieStore);
    mocks.getCurrentUser.mockResolvedValueOnce({
      workspaceOwnerId: "owner_1",
      workspaceRole: "admin"
    });

    const response = await GET(
      new Request("http://localhost/api/integrations/shopify/start?shop=acme-store.myshopify.com")
    );

    expect(cookieStore.set).toHaveBeenCalledWith(
      "chatting_shopify_oauth_state",
      "{\"state\":\"state_123\"}",
      expect.objectContaining({ path: "/", httpOnly: true })
    );
    expect(mocks.buildShopifyAuthorizeUrl).toHaveBeenCalledWith(
      "acme-store.myshopify.com",
      expect.any(String)
    );
    expect(response.headers.get("location")).toBe(
      "https://acme-store.myshopify.com/admin/oauth/authorize?client_id=123"
    );
    expect(response.status).toBe(302);
  });
});
