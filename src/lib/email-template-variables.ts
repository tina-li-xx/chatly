import { buildDashboardEmailTemplatePreviewLink } from "@/lib/email-template-preview";
import type {
  DashboardEmailTemplatePreviewContext,
  DashboardEmailTemplateVariable
} from "@/lib/email-template-types";

type VariableTokenMapEntry = DashboardEmailTemplateVariable & {
  tokenKey: keyof DashboardEmailTemplatePreviewContext;
  placeholder: string;
};

export const VARIABLE_TOKEN_MAP: VariableTokenMapEntry[] = [
  {
    tokenKey: "visitorName",
    placeholder: "{{visitor_name}}",
    token: "{{visitor_name}}",
    description: "Visitor's name",
    example: "Alex"
  },
  {
    tokenKey: "visitorEmail",
    placeholder: "{{visitor_email}}",
    token: "{{visitor_email}}",
    description: "Visitor's email",
    example: "alex@example.com"
  },
  {
    tokenKey: "teamName",
    placeholder: "{{team_name}}",
    token: "{{team_name}}",
    description: "Your team name",
    example: "Acme Support"
  },
  {
    tokenKey: "agentName",
    placeholder: "{{agent_name}}",
    token: "{{agent_name}}",
    description: "Replying agent's name",
    example: "Sarah"
  },
  {
    tokenKey: "companyName",
    placeholder: "{{company_name}}",
    token: "{{company_name}}",
    description: "Your company name",
    example: "Acme Inc"
  },
  {
    tokenKey: "conversationLink",
    placeholder: "{{conversation_link}}",
    token: "{{conversation_link}}",
    description: "Link to continue the conversation",
    example: buildDashboardEmailTemplatePreviewLink()
  },
  {
    tokenKey: "transcript",
    placeholder: "{{transcript}}",
    token: "{{transcript}}",
    description: "Formatted conversation history",
    example: "Visitor: Hi there\nTeam: Happy to help."
  },
  {
    tokenKey: "unsubscribeLink",
    placeholder: "{{unsubscribe_link}}",
    token: "{{unsubscribe_link}}",
    description: "Opt-out link",
    example: "https://usechatting.com/email/unsubscribe?token=abc123"
  }
];

export const EMAIL_TEMPLATE_VARIABLES: DashboardEmailTemplateVariable[] =
  VARIABLE_TOKEN_MAP.map(({ token, description, example }) => ({
    token,
    description,
    example
  }));
