import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createSite } from "./use-dashboard-actions.test-helpers";
import { WidgetBehaviorPanel } from "./dashboard-widget-settings-behavior-panel";
import { WidgetOfflineCopyPanel } from "./dashboard-widget-settings-offline-copy-panel";
import { WidgetInstallationPanel } from "./dashboard-widget-settings-installation-panel";

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

describe("widget behavior and installation panels", () => {
  it("updates behavior settings including proactive chat and operating hours", () => {
    const onUpdateActiveSite = vi.fn();
    const site = createSite({ autoOpenPaths: ["/pricing"], operatingHoursEnabled: true });
    const tree = WidgetBehaviorPanel({
      activeSite: site,
      proactiveChatUnlocked: true,
      onUpdateActiveSite
    });
    const toggles = collectElements(
      tree,
      (element) => typeof element.type === "function" && "label" in (element.props ?? {})
    );
    const inputs = collectElements(tree, (element) => element.type === "input");
    const selects = collectElements(tree, (element) => element.type === "select");

    toggles.find((element) => element.props.label === "Show online status")?.props.onToggle();
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(expect.objectContaining({ showOnlineStatus: false }));
    toggles.find((element) => element.props.label === "Require email when offline")?.props.onToggle();
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(expect.objectContaining({ requireEmailOffline: true }));
    toggles.find((element) => element.props.label === "Sound notifications")?.props.onToggle();
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(expect.objectContaining({ soundNotifications: false }));
    toggles.find((element) => element.props.label === "Auto-open on specific pages")?.props.onToggle();
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(expect.objectContaining({ autoOpenPaths: [] }));
    inputs.find((element) => element.props.placeholder === "/pricing, /contact")?.props.onChange({ target: { value: "/pricing, /docs" } });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(expect.objectContaining({ autoOpenPaths: ["/pricing", "/docs"] }));
    selects[0]?.props.onChange({ target: { value: "day" } });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(expect.objectContaining({ responseTimeMode: "day" }));
    toggles.find((element) => element.props.label === "Set operating hours")?.props.onToggle();
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(expect.objectContaining({ operatingHoursEnabled: false }));
    selects[1]?.props.onChange({ target: { value: "Europe/London" } });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(expect.objectContaining({ operatingHoursTimezone: "Europe/London" }));
    inputs.find((element) => element.props.type === "checkbox")?.props.onChange({ target: { checked: false } });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site).operatingHours.monday.enabled).toBe(false);
    inputs.filter((element) => element.props.type === "time")[0]?.props.onChange({ target: { value: "08:00" } });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site).operatingHours.monday.from).toBe("08:00");
    inputs.filter((element) => element.props.type === "time")[1]?.props.onChange({ target: { value: "18:00" } });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site).operatingHours.monday.to).toBe("18:00");
  });

  it("renders locked proactive chat copy and wires installation actions", () => {
    const onSetInstallPlatform = vi.fn();
    const onCopySnippet = vi.fn();
    const onVerifyInstallation = vi.fn();
    const lockedHtml = renderToStaticMarkup(
      <WidgetBehaviorPanel activeSite={createSite({ autoOpenPaths: [] })} proactiveChatUnlocked={false} onUpdateActiveSite={vi.fn()} />
    );
    const installTree = WidgetInstallationPanel({
      activeSite: createSite({ widgetInstallVerifiedAt: null, widgetLastSeenAt: null, conversationCount: 0 }),
      installPlatform: "html",
      copiedSnippet: false,
      verificationState: "idle",
      verificationError: "Unable to check installation right now.",
      onSetInstallPlatform,
      onCopySnippet,
      onVerifyInstallation
    });
    const installButtons = collectElements(installTree, (element) => element.type === "button");

    installButtons.find((element) => textContent(element.props.children).includes("React"))?.props.onClick();
    installButtons.find((element) => textContent(element.props.children).includes("Copy"))?.props.onClick();
    installButtons.find((element) => textContent(element.props.children).includes("Check installation"))?.props.onClick();
    installButtons.find((element) => textContent(element.props.children).includes("Shopify"))?.props.onClick();

    expect(lockedHtml).toContain("Upgrade to Growth to proactively open the widget");
    expect(onSetInstallPlatform).toHaveBeenCalledWith("react");
    expect(onSetInstallPlatform).toHaveBeenCalledWith("shopify");
    expect(onCopySnippet).toHaveBeenCalled();
    expect(onVerifyInstallation).toHaveBeenCalled();
    expect(renderToStaticMarkup(installTree)).toContain("Widget not detected");
    expect(renderToStaticMarkup(installTree)).toContain("Unable to check installation right now.");
  });

  it("updates offline and away copy settings", () => {
    const onUpdateActiveSite = vi.fn();
    const site = createSite({
      offlineMessage: "Leave your email and we'll reply within 2 hours.",
      awayMessage: "Support is away right now, but we'll email you back."
    });
    const tree = WidgetOfflineCopyPanel({ activeSite: site, onUpdateActiveSite });
    const controls = collectElements(
      tree,
      (element) => typeof element.type === "function" && typeof element.props?.onChange === "function"
    );

    controls.find((element) => element.props.value === site.offlineTitle)?.props.onChange({
      target: { value: "We're in meetings right now" }
    });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(
      expect.objectContaining({ offlineTitle: "We're in meetings right now" })
    );

    controls.find((element) => element.props.value === site.offlineMessage)?.props.onChange({
      target: { value: "Leave a message and we'll be back after lunch." }
    });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(
      expect.objectContaining({ offlineMessage: "Leave a message and we'll be back after lunch." })
    );

    controls.find((element) => element.props.value === site.awayTitle)?.props.onChange({
      target: { value: "We're stepping out for a bit" }
    });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(
      expect.objectContaining({ awayTitle: "We're stepping out for a bit" })
    );

    controls.find((element) => element.props.value === site.awayMessage)?.props.onChange({
      target: { value: "Leave your email and we'll follow up later today." }
    });
    expect(onUpdateActiveSite.mock.lastCall?.[0](site)).toEqual(
      expect.objectContaining({ awayMessage: "Leave your email and we'll follow up later today." })
    );

    const html = renderToStaticMarkup(tree);
    expect(html).toContain("Offline and away copy");
    expect(html).toContain("Offline title");
    expect(html).toContain("Away message");
  });
});
