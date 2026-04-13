import type { ComponentType, SVGProps } from "react";
import { BarChartIcon, CalendarIcon, ChatBubbleIcon, EyeIcon, InboxIcon } from "./dashboard-ui";

export type PublishingSection = "overview" | "strategy" | "plans" | "drafts" | "queue";

export type PublishingNavItem = {
  value: PublishingSection;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  description: string;
};

export const PUBLISHING_NAV: Array<{ label: string; items: PublishingNavItem[] }> = [
  {
    label: "Strategy",
    items: [
      { value: "overview", label: "Overview", icon: EyeIcon, description: "Internal SEO snapshot and pipeline state" },
      { value: "strategy", label: "Analysis", icon: ChatBubbleIcon, description: "Live audience, competitor, and keyword analysis" }
    ]
  },
  {
    label: "Pipeline",
    items: [
      { value: "plans", label: "Plans", icon: CalendarIcon, description: "Saved 30-day planning runs" },
      { value: "drafts", label: "Drafts", icon: BarChartIcon, description: "Generated article drafts" },
      { value: "queue", label: "Queue", icon: InboxIcon, description: "Draft and scheduled blog posts" }
    ]
  }
];
