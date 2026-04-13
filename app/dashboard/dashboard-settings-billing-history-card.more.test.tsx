import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks } from "./test-react-hooks";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  if (typeof element.type === "function") {
    return collect((element.type as (props: unknown) => ReactNode)(element.props), predicate);
  }
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

async function loadCard() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("../ui/form-controls", () => ({
    FormButton: ({ children, ...props }: Record<string, unknown>) => <button {...props}>{children}</button>
  }));
  vi.doMock("./dashboard-settings-shared", () => ({
    SettingsCard: ({ children, ...props }: Record<string, unknown>) => <section data-card={JSON.stringify(props)}>{children}</section>,
    formatMoney: (amountCents: number) => `$${amountCents / 100}`
  }));
  vi.doMock("@/lib/billing-plans", () => ({ getBillingPlanDefinition: () => ({ name: "Growth" }) }));
  vi.doMock("@/lib/utils", () => ({
    classNames: (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" "),
    formatDateTime: (value: string) => `date:${value}`
  }));
  vi.doMock("./dashboard-billing-utils", () => ({
    billingPeriodLabel: () => "monthly",
    invoiceStatusMeta: (status: string) => ({ label: status, className: `status-${status}` })
  }));
  vi.doMock("./dashboard-ui", () => ({
    ChevronDownIcon: () => <svg />,
    CreditCardIcon: () => <svg />,
    DownloadIcon: () => <svg />,
    ExternalLinkIcon: () => <svg />
  }));
  const module = await import("./dashboard-settings-billing-history-card");
  return { DashboardSettingsBillingHistoryCard: module.DashboardSettingsBillingHistoryCard, reactMocks };
}

function invoice(id: string, description: string, amountCents: number, status: "paid" | "open", urls = true) {
  return {
    id,
    issuedAt: `2026-03-${id.padStart(2, "0")}T00:00:00.000Z`,
    description,
    amountCents,
    currency: "usd",
    status,
    planKey: "growth",
    billingInterval: "monthly",
    seatQuantity: 1,
    invoicePdfUrl: urls ? `https://files.example/${id}.pdf` : null,
    hostedInvoiceUrl: urls ? `https://billing.example/${id}` : null
  };
}

describe("dashboard billing history card more", () => {
  it("toggles sort direction on the same key and resets pagination", async () => {
    const invoices = Array.from({ length: 11 }, (_, index) =>
      invoice(String(index + 1), `Invoice ${11 - index}`, 2000 + index, index % 2 ? "open" : "paid")
    );
    const { DashboardSettingsBillingHistoryCard, reactMocks } = await loadCard();

    reactMocks.beginRender();
    let tree = DashboardSettingsBillingHistoryCard({ invoices });
    collect(tree, (element) => element.type === "button" && element.props.children === "Next")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardSettingsBillingHistoryCard({ invoices });
    collect(tree, (element) => element.type === "button" && element.props.children?.[0] === "Amount")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardSettingsBillingHistoryCard({ invoices });
    collect(tree, (element) => element.type === "button" && element.props.children?.[0] === "Amount")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardSettingsBillingHistoryCard({ invoices });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain("Sorted ascending");
    expect(html).toContain("Showing 1-10 of 11 invoices");
  });

  it("renders single-page invoices without download or view actions when links are absent", async () => {
    const { DashboardSettingsBillingHistoryCard, reactMocks } = await loadCard();
    reactMocks.beginRender();
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingHistoryCard
        invoices={[
          invoice("1", "No links invoice", 1900, "paid", false),
          invoice("2", "Open invoice", 2100, "open", false)
        ]}
      />
    );

    expect(html).toContain("No links invoice");
    expect(html).toContain("status-open");
    expect(html).not.toContain("Prev");
    expect(html).not.toContain("Download invoice PDF");
    expect(html).not.toContain("View invoice");
  });
});
