import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const hookMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("./use-dashboard-integrations-state", () => ({
  useDashboardIntegrationsState: () => hookMock()
}));

import { DashboardSettingsIntegrationsWebhooksPage } from "./dashboard-settings-integrations-webhooks-page";

describe("dashboard settings integrations webhooks page", () => {
  it("shows the response action for failed webhook tests", () => {
    hookMock.mockReturnValue({
      hydrated: true,
      state: {
        slack: {
          status: "disconnected",
          workspaceName: "Acme Corp",
          channelId: "support-chat",
          channelName: "#support-chat",
          errorMessage: null,
          lastValidatedAt: null,
          notifications: {
            newConversation: true,
            assignedToMe: true,
            resolved: false,
            allMessages: false
          },
          replyFromSlack: true
        },
        zapier: {
          connected: false,
          apiKeyReady: true,
          apiKey: "ck_live_demo",
          activeZapCount: null
        },
        shopify: {
          status: "disconnected",
          domain: "",
          errorMessage: null
        },
        webhooks: [
          {
            id: "wh_failed",
            url: "https://api.example.com/fail",
            events: ["conversation.created"],
            secret: "",
            status: "active",
            lastTriggeredLabel: "Just now",
            lastResponseLabel: "Received 500 Internal Server Error",
            lastResponseBody: "{\"error\":\"Internal Server Error\"}",
            lastTestTone: "error"
          }
        ]
      },
      saveWebhook: vi.fn(),
      deleteWebhook: vi.fn(),
      testWebhook: vi.fn()
    });

    const html = renderToStaticMarkup(
      <DashboardSettingsIntegrationsWebhooksPage planKey="growth" />
    );

    expect(html).toContain("Test failed");
    expect(html).toContain("View response");
  });
});
