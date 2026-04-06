import type { ComponentType, SVGProps } from "react";
import type { DashboardAutomationSettings, DashboardSettingsData } from "@/lib/data/settings-types";
import {
  BarChartIcon,
  BellIcon,
  BoltIcon,
  ChatBubbleIcon,
  PeopleIcon,
  CodeIcon,
  CreditCardIcon,
  MailIcon,
  RefreshIcon,
  StarIcon,
  UserIcon
} from "./dashboard-ui";

export type SettingsSection =
  | "profile"
  | "contacts"
  | "automation"
  | "notifications"
  | "aiAssist"
  | "savedReplies"
  | "integrations"
  | "reports"
  | "email"
  | "billing"
  | "referrals";
export type EditableSettings =
  Pick<DashboardSettingsData, "profile" | "notifications" | "aiAssist" | "email" | "contacts"> & {
    teamName: string;
    reports: NonNullable<DashboardSettingsData["reports"]>;
    automation: DashboardAutomationSettings;
  };

export type SettingsNavItem =
  | {
      type: "section";
      value: SettingsSection;
      label: string;
      icon: ComponentType<SVGProps<SVGSVGElement>>;
      description: string;
    }
  | {
      type: "link";
      href: "/dashboard/team" | "/dashboard/widget";
      label: string;
      icon: ComponentType<SVGProps<SVGSVGElement>>;
      description: string;
    };

export const SETTINGS_NAV: Array<{ label: string; items: SettingsNavItem[] }> = [
  {
    label: "Account",
    items: [{ type: "section", value: "profile", label: "Profile", icon: UserIcon, description: "Personal info and preferences" }]
  },
  {
    label: "Preferences",
    items: [
      { type: "section", value: "contacts", label: "Contacts", icon: PeopleIcon, description: "Statuses, custom fields, and retention" },
      { type: "section", value: "automation", label: "Automation", icon: RefreshIcon, description: "Handle repetitive work automatically" },
      { type: "section", value: "notifications", label: "Notifications", icon: BellIcon, description: "Alert preferences" },
      { type: "section", value: "aiAssist", label: "AI Assist", icon: BoltIcon, description: "Summaries, suggestions, and rewrites" },
      { type: "section", value: "savedReplies", label: "Saved replies", icon: ChatBubbleIcon, description: "Canned replies for the inbox" },
      { type: "section", value: "integrations", label: "Integrations", icon: CodeIcon, description: "Connected tools and syncs" },
      { type: "section", value: "reports", label: "Reports", icon: BarChartIcon, description: "Weekly report delivery" },
      { type: "section", value: "email", label: "Email", icon: MailIcon, description: "Email settings and templates" }
    ]
  },
  {
    label: "Billing",
    items: [
      { type: "section", value: "billing", label: "Plans & Billing", icon: CreditCardIcon, description: "Subscription and invoices" },
      { type: "section", value: "referrals", label: "Referrals", icon: StarIcon, description: "Referral programs and signups" }
    ]
  }
];
