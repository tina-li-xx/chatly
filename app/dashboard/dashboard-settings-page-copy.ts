import type { SettingsSection } from "./dashboard-settings-shared";

export function getSettingsPageCopy(activeSection: SettingsSection) {
  switch (activeSection) {
    case "profile":
      return { title: "Profile", subtitle: "Manage your personal information and preferences" };
    case "contacts":
      return { title: "Contacts", subtitle: "Customize statuses and custom fields for people you talk to" };
    case "automation":
      return { title: "Automation", subtitle: "Handle the repetitive stuff automatically" };
    case "notifications":
      return { title: "Notifications", subtitle: "Choose how you want to be notified" };
    case "aiAssist":
      return { title: "AI Assist", subtitle: "Control summaries, reply suggestions, rewrites, and suggested tags" };
    case "savedReplies":
      return { title: "Saved replies", subtitle: "Manage reusable replies for the shared inbox" };
    case "integrations":
      return { title: "Integrations", subtitle: "Connect Chatting to your favorite tools" };
    case "reports":
      return { title: "Reports", subtitle: "Control weekly performance emails and delivery timing" };
    case "email":
      return { title: "Email", subtitle: "Configure email notifications and templates" };
    case "billing":
      return { title: "Plans & Billing", subtitle: "Manage your subscription, usage, and billing history" };
    case "referrals":
      return { title: "Referrals", subtitle: "Track referral programs, signups, and earned rewards" };
  }
}
