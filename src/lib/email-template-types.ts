import type { StyledEmailSection } from "@/lib/email-layout";

export type DashboardEmailTemplateKey =
  | "offline_reply"
  | "conversation_transcript"
  | "welcome_email"
  | "follow_up_email"
  | "satisfaction_survey";

export type DashboardEmailTemplateIcon =
  | "mail"
  | "transcript"
  | "welcome"
  | "follow_up"
  | "survey";

export type DashboardEmailTemplate = {
  key: DashboardEmailTemplateKey;
  name: string;
  description: string;
  trigger: string;
  icon: DashboardEmailTemplateIcon;
  subject: string;
  body: string;
  enabled: boolean;
  updatedAt: string | null;
};

export type DashboardEmailTemplateVariable = {
  token: string;
  description: string;
  example: string;
};

export type DashboardEmailTemplatePreviewContext = {
  visitorName: string;
  visitorEmail: string;
  teamName: string;
  agentName: string;
  companyName: string;
  conversationLink: string;
  transcript: string;
  unsubscribeLink: string;
};

export type DashboardEmailTemplateSection = StyledEmailSection;

export type StoredDashboardEmailTemplate = {
  key: DashboardEmailTemplateKey;
  subject?: string;
  body?: string;
  enabled?: boolean;
  updatedAt?: string | null;
};

export type TemplateDefinition = Omit<
  DashboardEmailTemplate,
  "subject" | "body" | "enabled" | "updatedAt"
> & {
  defaultSubject: string;
  defaultBody: string;
};
