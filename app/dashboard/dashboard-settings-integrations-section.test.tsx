import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_INTEGRATIONS_STATE } from "./dashboard-integrations-types";

const hookMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("./use-dashboard-integrations-state", () => ({
  useDashboardIntegrationsState: () => hookMock()
}));

import { SettingsIntegrationsSection } from "./dashboard-settings-integrations-section";

const baseProps = {
  title: "Integrations",
  subtitle: "Connect Chatting to your favorite tools",
  billing: {
    planKey: "starter" as const,
    billingInterval: "monthly" as const,
    usedSeats: 1,
    includedSeats: 1,
    extraSeatPriceCents: 0,
    hasPaymentMethod: false,
    trialEndsAtLabel: null,
    nextInvoiceLabel: null,
    planAmountLabel: "$0/month",
    seatSummaryLabel: "1 member",
    seatPriceLabel: null,
    subtotalLabel: "$0.00",
    discountLabel: null,
    totalLabel: "$0.00",
    portalAvailable: false
  },
  billingPlanPending: null,
  selectedInterval: "monthly" as const,
  onChangePlan: vi.fn()
};

function buildHookValue(state = DEFAULT_INTEGRATIONS_STATE) {
  return {
    state,
    hydrated: true,
    saveSlack: vi.fn(),
    updateSlack: vi.fn(),
    disconnectSlack: vi.fn(),
    setSlackError: vi.fn(),
    markSlackReconnect: vi.fn(),
    activateZapier: vi.fn(),
    disconnectZapier: vi.fn(),
    connectShopify: vi.fn(),
    disconnectShopify: vi.fn(),
    setShopifyError: vi.fn()
  };
}

function renderSection(planKey: "starter" | "growth") {
  return renderToStaticMarkup(<SettingsIntegrationsSection {...baseProps} planKey={planKey} />);
}

describe("settings integrations section", () => {
  beforeEach(() => {
    hookMock.mockReset();
  });

  it("locks integrations on starter", () => {
    hookMock.mockReturnValue(buildHookValue());

    const html = renderSection("starter");

    expect(html).toContain("Slack");
    expect(html).toContain("Webhooks");
    expect(html).toContain("Upgrade to Growth");
  });

  it("renders connected summaries on growth", () => {
    hookMock.mockReturnValue(buildHookValue({
      ...DEFAULT_INTEGRATIONS_STATE,
      slack: { ...DEFAULT_INTEGRATIONS_STATE.slack, status: "connected", channelName: "#support-chat" },
      zapier: { ...DEFAULT_INTEGRATIONS_STATE.zapier, connected: true, apiKeyReady: true, activeZapCount: 3 },
      shopify: { status: "connected", domain: "acme-store.myshopify.com", errorMessage: null },
      webhooks: [
        { id: "wh_1", url: "https://api.example.com/chatting", events: ["conversation.created"], secret: "", status: "active", lastTriggeredLabel: "2 hours ago", lastResponseLabel: null, lastResponseBody: null, lastTestTone: null },
        { id: "wh_2", url: "https://hooks.zapier.com/test", events: ["contact.created"], secret: "", status: "active", lastTriggeredLabel: "5 days ago", lastResponseLabel: null, lastResponseBody: null, lastTestTone: null }
      ]
    }));

    const html = renderSection("growth");

    expect(html).toContain("Posting to #support-chat");
    expect(html).toContain("3 active Zaps");
    expect(html).toContain("Sending to 2 endpoints");
    expect(html).toContain("acme-store.myshopify.com");
  });

  it("renders Zapier as ready when only the API key has been provisioned", () => {
    hookMock.mockReturnValue(buildHookValue({
      ...DEFAULT_INTEGRATIONS_STATE,
      zapier: {
        ...DEFAULT_INTEGRATIONS_STATE.zapier,
        apiKeyReady: true,
        apiKey: "ck_live_ready",
        activeZapCount: 0
      }
    }));

    const html = renderSection("growth");

    expect(html).toContain("API key ready");
    expect(html).toContain("Ready");
    expect(html).not.toContain("Connected");
  });

  it("uses the spec grid and card sizing classes", () => {
    hookMock.mockReturnValue(buildHookValue());

    const html = renderSection("growth");

    expect(html).toContain("grid max-w-[700px] gap-5 md:grid-cols-2");
    expect(html).toContain("min-h-[180px]");
    expect(html).toContain("rounded-xl border p-6");
  });

  it("renders reconnect and retry states", () => {
    hookMock.mockReturnValue(buildHookValue({
      ...DEFAULT_INTEGRATIONS_STATE,
      slack: { ...DEFAULT_INTEGRATIONS_STATE.slack, status: "reconnect", errorMessage: "Connection lost" },
      shopify: { status: "error", domain: "", errorMessage: "Please try again. If the problem continues, contact support." }
    }));

    const html = renderSection("growth");

    expect(html).toContain("Reconnect");
    expect(html).toContain("Connection lost");
    expect(html).toContain("Try again");
  });
});
