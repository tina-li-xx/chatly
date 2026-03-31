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
  vi.doMock("@/lib/utils", () => ({ formatDateTime: (value: string) => `date:${value}` }));
  vi.doMock("./dashboard-billing-utils", () => ({
    billingPeriodLabel: () => "monthly",
    invoiceStatusMeta: (status: string) => ({ label: status, className: "status-pill" })
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

const invoice = {
  id: "invoice_1",
  issuedAt: "2026-03-01T00:00:00.000Z",
  description: "Growth monthly",
  amountCents: 2000,
  currency: "usd",
  status: "paid",
  planKey: "growth",
  billingInterval: "monthly",
  seatQuantity: 3,
  invoicePdfUrl: "https://files.example/invoice.pdf",
  hostedInvoiceUrl: "https://billing.example/invoice"
};

describe("dashboard billing history card", () => {
  it("renders the empty state with no invoices", async () => {
    const { DashboardSettingsBillingHistoryCard, reactMocks } = await loadCard();
    reactMocks.beginRender();
    const html = renderToStaticMarkup(<DashboardSettingsBillingHistoryCard invoices={[]} />);
    expect(html).toContain("No billing history yet");
  });

  it("renders invoices and updates sorting and pagination controls", async () => {
    const { DashboardSettingsBillingHistoryCard, reactMocks } = await loadCard();
    reactMocks.beginRender();
    let tree = DashboardSettingsBillingHistoryCard({ invoices: Array.from({ length: 11 }, (_, index) => ({ ...invoice, id: `invoice_${index}` })) });
    collect(tree, (element) => element.type === "button" && element.props.children?.[0] === "Description")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardSettingsBillingHistoryCard({ invoices: Array.from({ length: 11 }, (_, index) => ({ ...invoice, id: `invoice_${index}` })) });
    collect(tree, (element) => element.type === "button" && element.props.children === "Next")[0]?.props.onClick();
    reactMocks.beginRender();
    tree = DashboardSettingsBillingHistoryCard({ invoices: Array.from({ length: 11 }, (_, index) => ({ ...invoice, id: `invoice_${index}` })) });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain("Growth monthly");
    expect(html).toContain("Showing 11-11 of 11 invoices");
    expect(html).toContain("status-pill");
  });
});
