"use client";

import { ThreadShopifyCustomerPanelView } from "./dashboard-thread-detail-shopify-panel-view";
import { useDashboardShopifyCustomerContext } from "./use-dashboard-shopify-customer-context";

export function ThreadShopifyCustomerPanel({
  conversationId
}: {
  conversationId: string;
}) {
  const context = useDashboardShopifyCustomerContext(conversationId);
  if (context.status === "loading") {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-4 animate-pulse">
        <div className="h-3 w-16 rounded bg-emerald-100" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="flex justify-between gap-3">
              <div className="h-4 w-24 rounded bg-emerald-100" />
              <div className="h-4 w-20 rounded bg-emerald-100" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return context.status === "ready" ? (
    <ThreadShopifyCustomerPanelView customer={context.customer} />
  ) : null;
}
