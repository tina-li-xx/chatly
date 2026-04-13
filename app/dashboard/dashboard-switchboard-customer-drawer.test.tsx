import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSwitchboardCustomerDrawer } from "./dashboard-switchboard-customer-drawer";

const WORKSPACE = {
  ownerUserId: "owner_1",
  ownerEmail: "owner@example.com",
  ownerCreatedAt: "2026-03-20T10:00:00.000Z",
  emailVerifiedAt: "2026-03-20T10:05:00.000Z",
  teamName: "Acme",
  primaryDomain: "acme.com",
  siteCount: 2,
  siteDomains: ["acme.com", "docs.acme.com"],
  verifiedWidgetCount: 1,
  hasWidgetInstalled: true,
  planKey: "growth" as const,
  planName: "Growth",
  billingInterval: "monthly" as const,
  subscriptionStatus: "active",
  seatQuantity: 3,
  teamMemberCount: 3,
  trialEndsAt: null,
  conversationsLast30Days: 34,
  conversationsLast7Days: 9,
  openConversations: 4,
  lastConversationAt: "2026-04-13T10:30:00.000Z",
  lastLoginAt: "2026-04-13T09:30:00.000Z",
  attentionFlags: ["widget", "quiet"]
};

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectElements(child, predicate));
  }
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

describe("switchboard customer drawer", () => {
  it("returns null without a selected workspace", () => {
    expect(DashboardSwitchboardCustomerDrawer({ workspace: null, onClose: vi.fn() })).toBeNull();
  });

  it("renders workspace details and forwards close actions", () => {
    const onClose = vi.fn();
    const tree = DashboardSwitchboardCustomerDrawer({ workspace: WORKSPACE, onClose });
    const buttons = collectElements(tree, (element) => element.type === "button");
    const html = renderToStaticMarkup(tree);

    expect(html).toContain("Workspace details");
    expect(html).toContain("owner@example.com");
    expect(html).toContain("Growth");
    expect(html).toContain("34");
    expect(html).toContain("acme.com");
    expect(html).toContain("widget install");

    (tree as ReactElement).props.onClick();
    buttons[0]?.props.onClick();

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("shows empty states when a workspace has no domains or attention flags", () => {
    const html = renderToStaticMarkup(
      <DashboardSwitchboardCustomerDrawer
        workspace={{ ...WORKSPACE, primaryDomain: null, siteDomains: [], attentionFlags: [], emailVerifiedAt: null }}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain("No connected sites yet.");
    expect(html).toContain("Healthy right now.");
    expect(html).toContain("Not yet");
  });
});
