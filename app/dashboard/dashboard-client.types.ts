"use client";

import type { FormEvent } from "react";
import type {
  ConversationSummary,
  ConversationThread,
  DashboardStats,
  Site
} from "@/lib/types";

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
};

export type DashboardActionHandlers = {
  onSaveSiteTitle: (event: FormEvent<HTMLFormElement>, siteId: string) => Promise<void>;
  onSaveConversationEmail: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSendReply: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onToggleTag: (tag: string) => Promise<void>;
};
