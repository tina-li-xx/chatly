import { fetchShopifyCustomerContext } from "@/lib/shopify-customer-context";

describe("shopify customer context", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps Shopify GraphQL customer data into the inbox sidebar shape", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          customers: {
            nodes: [
              {
                displayName: "Alex Stone",
                legacyResourceId: "123",
                createdAt: "2023-03-01T10:00:00.000Z",
                numberOfOrders: "7",
                amountSpent: { amount: "847", currencyCode: "USD" },
                lastOrder: { createdAt: "2024-03-15T10:00:00.000Z" },
                orders: {
                  nodes: [
                    {
                      name: "#1047",
                      createdAt: "2024-03-15T10:00:00.000Z",
                      displayFulfillmentStatus: "FULFILLED",
                      currentTotalPriceSet: {
                        shopMoney: { amount: "129", currencyCode: "USD" }
                      },
                      lineItems: {
                        nodes: [{ name: "Blue Widget" }, { name: "Red Widget" }]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchShopifyCustomerContext({
      accessToken: "shpat_live",
      domain: "acme-store.myshopify.com",
      email: "alex@example.com"
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://acme-store.myshopify.com/admin/api/2026-04/graphql.json",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-shopify-access-token": "shpat_live"
        })
      })
    );
    expect(result).toMatchObject({
      displayName: "Alex Stone",
      customerSinceLabel: "Mar 2023",
      totalOrders: 7,
      totalSpentLabel: "$847.00",
      lastOrderLabel: "Mar 15, 2024",
      recentOrders: [
        {
          id: "#1047",
          totalLabel: "$129.00",
          itemsLabel: "Blue Widget, Red Widget",
          statusLabel: "Fulfilled"
        }
      ],
      customerUrl: "https://acme-store.myshopify.com/admin/customers/123"
    });
  });

  it("returns null when Shopify has no matching customer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { customers: { nodes: [] } } })
      })
    );

    await expect(
      fetchShopifyCustomerContext({
        accessToken: "shpat_live",
        domain: "acme-store.myshopify.com",
        email: "missing@example.com"
      })
    ).resolves.toBeNull();
  });
});
