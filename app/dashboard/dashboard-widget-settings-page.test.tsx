import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import { createSite } from "./use-dashboard-actions.test-helpers";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
}

const billing = {
  planKey: "growth",
  planName: "Growth",
  priceLabel: "$20/month",
  billingInterval: "monthly",
  usedSeats: 1,
  billedSeats: 1,
  seatLimit: null,
  siteCount: 1,
  conversationCount: 2,
  messageCount: 3,
  avgResponseSeconds: 60,
  conversationLimit: null,
  conversationUsagePercent: null,
  upgradePromptThreshold: 30,
  remainingConversations: null,
  showUpgradePrompt: false,
  limitReached: false,
  nextBillingDate: null,
  trialEndsAt: null,
  subscriptionStatus: "active",
  customerId: "cus_1",
  portalAvailable: true,
  checkoutAvailable: true,
  features: { billedPerSeat: true, proactiveChat: true, removeBranding: true },
  paymentMethod: null,
  invoices: [],
  referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 }
} as DashboardBillingSummary;

async function loadPage(hookValue: Record<string, unknown>) {
  vi.resetModules();
  const captures: Record<string, unknown> = {};
  vi.doMock("./use-dashboard-widget-settings", () => ({
    useDashboardWidgetSettings: () => hookValue
  }));
  vi.doMock("./dashboard-widget-settings-appearance-panel", () => ({ WidgetAppearancePanel: (props: unknown) => ((captures.appearance = props), <div>appearance</div>) }));
  vi.doMock("./dashboard-widget-settings-behavior-panel", () => ({ WidgetBehaviorPanel: (props: unknown) => ((captures.behavior = props), <div>behavior</div>) }));
  vi.doMock("./dashboard-widget-settings-installation-panel", () => ({ WidgetInstallationPanel: (props: unknown) => ((captures.installation = props), <div>installation</div>) }));
  vi.doMock("./dashboard-widget-settings-preview", () => ({ WidgetPreviewFrame: (props: unknown) => ((captures.preview = props), <div>preview</div>) }));

  const module = await import("./dashboard-widget-settings-page");
  return { DashboardWidgetSettingsPage: module.DashboardWidgetSettingsPage, captures };
}

describe("dashboard widget settings page", () => {
  it("renders the empty state when there is no active site", async () => {
    const { DashboardWidgetSettingsPage } = await loadPage({
      activeSite: null,
      activeSiteId: null,
      activeTab: "appearance",
      copiedSnippet: false,
      copySnippet: vi.fn(),
      draftSites: [],
      hasUnsavedChanges: false,
      installPlatform: "html",
      photoActionState: "idle",
      photoError: "",
      previewDevice: "desktop",
      saveError: "",
      saveState: "idle",
      setActiveSiteId: vi.fn(),
      setActiveTab: vi.fn(),
      setInstallPlatform: vi.fn(),
      setPreviewDevice: vi.fn(),
      showSavedToast: false,
      updateActiveSite: vi.fn(),
      discardChanges: vi.fn(),
      removeTeamPhoto: vi.fn(),
      saveChanges: vi.fn(),
      uploadTeamPhoto: vi.fn(),
      verificationError: "",
      verificationState: "idle",
      verifyInstallation: vi.fn()
    });

    const html = renderToStaticMarkup(<DashboardWidgetSettingsPage initialSites={[]} initialBilling={billing} />);
    expect(html).toContain("Once you have a site in Chatting");
  });

  it("wires page actions, tab switches, and preview device toggles through the hook", async () => {
    const setActiveSiteId = vi.fn();
    const setActiveTab = vi.fn();
    const setPreviewDevice = vi.fn();
    const discardChanges = vi.fn();
    const saveChanges = vi.fn();
    const draftSites = [createSite(), createSite({ id: "site_2", name: "Docs" })];
    const { DashboardWidgetSettingsPage, captures } = await loadPage({
      activeSite: draftSites[0],
      activeSiteId: "site_1",
      activeTab: "installation",
      copiedSnippet: false,
      copySnippet: vi.fn(),
      draftSites,
      hasUnsavedChanges: true,
      installPlatform: "html",
      photoActionState: "idle",
      photoError: "",
      previewDevice: "desktop",
      saveError: "Unable to save widget settings.",
      saveState: "saved",
      setActiveSiteId,
      setActiveTab,
      setInstallPlatform: vi.fn(),
      setPreviewDevice,
      showSavedToast: true,
      updateActiveSite: vi.fn(),
      discardChanges,
      removeTeamPhoto: vi.fn(),
      saveChanges,
      uploadTeamPhoto: vi.fn(),
      verificationError: "",
      verificationState: "idle",
      verifyInstallation: vi.fn()
    });

    const tree = <DashboardWidgetSettingsPage initialSites={draftSites} initialBilling={billing} />;
    const rendered = DashboardWidgetSettingsPage({ initialSites: draftSites, initialBilling: billing });
    const selects = collectElements(rendered, (element) => element.type === "select");
    const buttons = collectElements(rendered, (element) => element.type === "button");
    const html = renderToStaticMarkup(tree);

    selects[0]?.props.onChange({ target: { value: "site_2" } });
    buttons.find((element) => textContent(element.props.children).includes("Discard"))?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Saved!"))?.props.onClick();
    buttons.find((element) => textContent(element.props.children).includes("Appearance"))?.props.onClick();
    buttons.find((element) => element.props["aria-label"] === "Mobile")?.props.onClick();

    expect(setActiveSiteId).toHaveBeenCalledWith("site_2");
    expect(discardChanges).toHaveBeenCalled();
    expect(saveChanges).toHaveBeenCalled();
    expect(setActiveTab).toHaveBeenCalledWith("appearance");
    expect(setPreviewDevice).toHaveBeenCalledWith("mobile");
    expect(captures.installation).toMatchObject({ activeSite: draftSites[0], installPlatform: "html" });
    expect(captures.preview).toMatchObject({ site: draftSites[0], device: "desktop" });
    expect(html).toContain("Unable to save widget settings.");
    expect(html).toContain("Widget settings saved");
  });
});
