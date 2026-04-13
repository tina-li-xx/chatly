import type { ComponentType, SVGProps } from "react";
import { PUBLISHING_NAV } from "./dashboard-publishing-types";
import {
  BarChartIcon,
  ClockIcon,
  PeopleIcon,
  WarningIcon
} from "./dashboard-ui";
import type { SwitchboardSection } from "./dashboard-switchboard-section";

export type SwitchboardNavItem = {
  value: SwitchboardSection;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  mobileLabel?: string;
};

export const SWITCHBOARD_NAV: Array<{ label: string; items: SwitchboardNavItem[] }> = [
  {
    label: "Overview",
    items: [
      {
        value: "overview",
        label: "Overview",
        icon: BarChartIcon,
        description: "Topline SaaS metrics",
        mobileLabel: "SaaS overview"
      }
    ]
  },
  {
    label: "Queues",
    items: [
      {
        value: "attention",
        label: "Attention",
        icon: WarningIcon,
        description: "Accounts worth checking"
      },
      {
        value: "activity",
        label: "Recent activity",
        icon: ClockIcon,
        description: "Latest conversations"
      }
    ]
  },
  {
    label: "CRM",
    items: [
      {
        value: "customers",
        label: "Customers",
        icon: PeopleIcon,
        description: "Workspace rollup table"
      }
    ]
  },
  ...PUBLISHING_NAV.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({
      value: `publishing-${item.value}` as SwitchboardSection,
      label: item.label,
      mobileLabel: item.value === "overview" ? "SEO overview" : undefined,
      description: item.description,
      icon: item.icon
    }))
  }))
];

export function getSwitchboardPageCopy(activeSection: SwitchboardSection) {
  switch (activeSection) {
    case "attention":
      return {
        title: "Attention",
        subtitle: "The short list worth checking before it turns into churn."
      };
    case "activity":
      return {
        title: "Recent activity",
        subtitle: "Conversation activity from the last 30 days across all active workspaces."
      };
    case "customers":
      return {
        title: "Customers",
        subtitle: "A read-only CRM rollup of owners, plans, installs, and current momentum."
      };
    case "publishing-overview":
      return {
        title: "SEO overview",
        subtitle: "Internal SEO snapshot and pipeline state."
      };
    case "publishing-strategy":
      return {
        title: "Analysis",
        subtitle: "Live audience, competitor, and keyword analysis."
      };
    case "publishing-plans":
      return {
        title: "Plans",
        subtitle: "Saved 30-day planning runs."
      };
    case "publishing-drafts":
      return {
        title: "Drafts",
        subtitle: "Generated article drafts."
      };
    case "publishing-queue":
      return {
        title: "Queue",
        subtitle: "Draft and scheduled blog posts."
      };
    case "overview":
    default:
      return {
        title: "Overview",
        subtitle: "Topline SaaS metrics across workspaces, billing, installs, and conversation volume."
      };
  }
}
