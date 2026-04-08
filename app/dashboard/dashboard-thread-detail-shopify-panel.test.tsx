import { renderToStaticMarkup } from "react-dom/server";

const hookMock = vi.fn();

vi.mock("./use-dashboard-shopify-customer-context", () => ({
  useDashboardShopifyCustomerContext: () => hookMock()
}));

import { ThreadShopifyCustomerPanel } from "./dashboard-thread-detail-shopify-panel";

describe("thread shopify customer panel", () => {
  beforeEach(() => {
    hookMock.mockReset();
  });

  it("renders customer context and recent orders", () => {
    hookMock.mockReturnValue({
      status: "ready",
      customer: {
        displayName: "Alex Stone",
        customerSinceLabel: "Mar 2023",
        totalOrders: 7,
        totalSpentLabel: "$847.00",
        lastOrderLabel: "Mar 15, 2024",
        recentOrders: [
          {
            id: "#1047",
            totalLabel: "$129.00",
            dateLabel: "Mar 15",
            itemsLabel: "Blue Widget, Red Widget",
            statusLabel: "Shipped"
          }
        ],
        customerUrl: "https://acme-store.myshopify.com/admin/customers/123"
      }
    });

    const html = renderToStaticMarkup(
      <ThreadShopifyCustomerPanel conversationId="conv_1" />
    );

    expect(html).toContain("Shopify");
    expect(html).toContain("Customer since");
    expect(html).toContain("Total orders");
    expect(html).toContain("Recent orders");
    expect(html).toContain("View in Shopify");
    expect(html).toContain("admin/customers/123");
  });
});
