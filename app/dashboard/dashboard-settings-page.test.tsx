import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createSettingsPageInitialData } from "./dashboard-settings-page.test-helpers";

type SettingsSection = "profile" | "notifications" | "reports" | "email" | "savedReplies" | "integrations" | "billing" | "referrals";

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
  vi.doMock("./dashboard-settings-saved-replies-section", () => ({
    SettingsSavedRepliesSection: ({
      title,
      subtitle
    }: {
      title: string;
      subtitle: string;
    }) => (
      <div>
        <div>{title}</div>
        <div>{subtitle}</div>
        <div>Saved replies section</div>
      </div>
    )
  }));
  vi.doMock("./dashboard-settings-integrations-section", () => ({
    SettingsIntegrationsSection: ({
      title,
      subtitle
    }: {
      title: string;
      subtitle: string;
    }) => (
      <div>
        <div>{title}</div>
        <div>{subtitle}</div>
        <div>Integrations section</div>
      </div>
    )
  }));
  const module = await import("./dashboard-settings-page");
  const DashboardSettingsPage = module.DashboardSettingsPage;
  return renderToStaticMarkup(
    <DashboardSettingsPage
      initialData={createSettingsPageInitialData()}
      activeSection={section}
    />
  );
}

describe("dashboard settings page", () => {
  it("renders the profile section", async () => {
    const html = await renderSettingsPage("profile");
    expect(html).toContain("Manage your personal information and preferences");
    expect(html).toContain("Personal information");
    expect(html).toContain("Team identity");
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
  it("renders the reports section", async () => {
    const html = await renderSettingsPage("reports");
    expect(html).toContain("Control weekly performance emails and delivery timing");
    expect(html).toContain("Your weekly report");
    expect(html).toContain("Send time");
    expect(html).toContain("Team report defaults");
  });

  it("renders the saved replies section", async () => {
    const html = await renderSettingsPage("savedReplies");
    expect(html).toContain("Manage reusable replies for the shared inbox");
    expect(html).toContain("Saved replies section");
  });

  it("renders the integrations section", async () => {
    const html = await renderSettingsPage("integrations");
    expect(html).toContain("Connect Chatting to your favorite tools");
    expect(html).toContain("Integrations section");
  });

  it("renders the billing section", async () => {
    const html = await renderSettingsPage("billing");
    const currentPlanMatches = html.match(/Current plan/g) ?? [];

    expect(html).toContain("Manage your subscription, usage, and billing history");
    expect(html).toContain("Starter Plan");
    expect(html).toContain("Usage this billing period");
    expect(html).toContain("messages sent");
    expect(html).toContain("avg response time");
    expect(html).toContain("Compare plans");
    expect(html).toContain("How many team members?");
    expect(html).toContain("Current plan");
    expect(currentPlanMatches.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("50 conversations each month");
    expect(html).toContain("Advanced analytics");
    expect(html).toContain("API access");
    expect(html).toContain("Billing history");
    expect(html).not.toContain("Discard");
    expect(html).not.toContain("Save changes");
  });

  it("renders the referrals section", async () => {
    const html = await renderSettingsPage("referrals");
    expect(html).toContain("Track referral programs, signups, and earned rewards");
    expect(html).toContain("Referral programs");
    expect(html).toContain("Referred signups");
    expect(html).toContain("Pending rewards");
    expect(html).toContain("Earned value tracked");
    expect(html).toContain("No referred signups yet.");
  });
});
