"use client";

import type { FormEvent } from "react";
import type {
  ConversationSummary,
  ConversationThread,
  DashboardStats,
  Site
} from "@/lib/types";
import type { BillingPlanKey } from "@/lib/billing-plans";
import type { DashboardAiAssistSettings } from "@/lib/data/settings-ai-assist";
import type { DashboardTeamMember } from "@/lib/data/settings-types";

export type BannerState = {
  tone: "error" | "success";
  text: string;
} | null;

export type DashboardClientProps = {
  userEmail: string;
  initialStats: DashboardStats;
  initialSites: Site[];
  initialConversations: ConversationSummary[];
  initialActiveConversation: ConversationThread | null;
  initialTeamMembers?: DashboardTeamMember[];
  initialAiAssistSettings: DashboardAiAssistSettings;
  initialBillingPlanKey: BillingPlanKey;
};

export type DashboardActionHandlers = {
  onSaveSiteTitle: (event: FormEvent<HTMLFormElement>, siteId: string) => Promise<void>;
  onSaveConversationEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSendReply: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onToggleTag: (tag: string) => Promise<void>;
};
