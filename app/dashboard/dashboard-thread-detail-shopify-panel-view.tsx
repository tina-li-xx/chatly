import type { ShopifyCustomerContext } from "@/lib/dashboard-integrations";

export function ThreadShopifyCustomerPanelView({
  customer
}: {
  customer: ShopifyCustomerContext;
}) {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-4">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.05em] text-emerald-700">Shopify</h3>
      <div className="mt-4 space-y-2 text-[13px]">
        <PanelRow label="Customer since" value={customer.customerSinceLabel} />
        <PanelRow label="Total orders" value={String(customer.totalOrders)} />
        <PanelRow label="Total spent" value={customer.totalSpentLabel} />
        <PanelRow label="Last order" value={customer.lastOrderLabel} />
      </div>

      <div className="my-4 h-px bg-emerald-200" />

      <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-emerald-700">Recent orders</p>
      <div className="mt-3 space-y-3">
        {customer.recentOrders.map((order) => (
          <div key={`${order.id}:${order.dateLabel}`} className="rounded-xl bg-white/80 px-3 py-3 text-[13px] text-slate-700">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-900">
                {order.id} · {order.totalLabel}
              </p>
              <p className="text-slate-500">{order.dateLabel}</p>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-slate-500">
              <p>{order.itemsLabel}</p>
              <p>{order.statusLabel}</p>
            </div>
          </div>
        ))}
      </div>

      <a href={customer.customerUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-medium text-emerald-700 transition hover:text-emerald-800">
        View in Shopify →
      </a>
    </section>
  );
}

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-900">{value}</span>
    </div>
  );
}
