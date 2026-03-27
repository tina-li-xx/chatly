import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type SettingsSection = "profile" | "notifications" | "email" | "billing";

async function renderSettingsPage(section: SettingsSection) {
  vi.resetModules();

  vi.doMock("next/navigation", () => ({
    useSearchParams: () => ({
      get: () => null
    })
  }));

  vi.doMock("next/link", () => ({
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

  vi.doMock("./settings-email-templates", () => ({
    SettingsEmailTemplates: () => <div>Email templates editor</div>
  }));

  vi.doMock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");
    let useStateCalls = 0;

    return {
      ...actual,
      useEffect: vi.fn(),
      useState: vi.fn((initialValue: unknown) => {
        useStateCalls += 1;
        if (useStateCalls === 1) {
          return [section, vi.fn()];
        }

        return actual.useState(initialValue);
      })
    };
  });

  const module = await import("./dashboard-settings-page");
  const DashboardSettingsPage = module.DashboardSettingsPage;

  const initialData = {
    profile: {
      firstName: "Tina",
      lastName: "Bauer",
      email: "tina@chatly.example",
      jobTitle: "Founder",
      avatarDataUrl: null
    },
    notifications: {
      browserNotifications: true,
      soundAlerts: true,
      emailNotifications: true,
      newVisitorAlerts: false,
      highIntentAlerts: true
    },
    email: {
      notificationEmail: "team@chatly.example",
      replyToEmail: "reply@chatly.example",
      templates: [],
      emailSignature: "Best,\nChatting"
    },
    teamMembers: [],
    teamInvites: [],
    billing: {
      planKey: "starter",
      planName: "Starter Plan",
      priceLabel: "$0/month",
      usedSeats: 1,
      seatLimit: 5,
      siteCount: 1,
      conversationCount: 12,
      nextBillingDate: null,
      subscriptionStatus: null,
      customerId: null,
      portalAvailable: false,
      checkoutAvailable: true,
      paymentMethod: null,
      invoices: []
    }
  };

  return renderToStaticMarkup(<DashboardSettingsPage initialData={initialData} />);
}

describe("dashboard settings page", () => {
  it("renders the profile section", async () => {
    const html = await renderSettingsPage("profile");

    expect(html).toContain("Manage your personal information and preferences");
    expect(html).toContain("Personal information");
    expect(html).toContain("Change password");
    expect(html).toContain("Upload photo");
  });

  it("renders the notifications section", async () => {
    const html = await renderSettingsPage("notifications");

    expect(html).toContain("Choose how you want to be notified");
    expect(html).toContain("Browser notifications");
    expect(html).toContain("New visitor alerts");
    expect(html).toContain("High-intent alerts");
  });

  it("renders the email section", async () => {
    const html = await renderSettingsPage("email");

    expect(html).toContain("Configure email notifications and templates");
    expect(html).toContain("Notification email");
    expect(html).toContain("Reply-to address");
    expect(html).toContain("Email templates editor");
    expect(html).toContain("Email signature");
  });

  it("renders the billing section", async () => {
    const html = await renderSettingsPage("billing");

    expect(html).toContain("Manage your subscription and payment methods");
    expect(html).toContain("Starter Plan");
    expect(html).toContain("Compare plans");
    expect(html).toContain("Payment method");
    expect(html).toContain("Billing history");
  });
});
