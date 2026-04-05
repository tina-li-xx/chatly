import type {
  DashboardEmailTemplate,
  DashboardEmailTemplateKey,
  TemplateDefinition
} from "@/lib/email-template-types";

export const TEMPLATE_DEFINITIONS: Record<
  DashboardEmailTemplateKey,
  TemplateDefinition
> = {
  offline_reply: {
    key: "offline_reply",
    name: "Offline reply",
    description: "Sent when team replies while visitor is offline",
    trigger: "Automatic when visitor offline",
    icon: "mail",
    defaultSubject: "{{team_name}} replied to your message",
    defaultBody: `{{agent_name}} from {{team_name}} just replied.

{{transcript}}
`
  },
  conversation_transcript: {
    key: "conversation_transcript",
    name: "Conversation transcript",
    description: "Emailed conversation history to visitors",
    trigger: "On request or after resolution",
    icon: "transcript",
    defaultSubject: "Your conversation with {{team_name}}",
    defaultBody: `Thanks for chatting with us! Here's a copy of your conversation for your records.

{{transcript}}`
  },
  welcome_email: {
    key: "welcome_email",
    name: "Welcome email",
    description: "Sent to new identified visitors",
    trigger: "When email is captured",
    icon: "welcome",
    defaultSubject: "Welcome to {{company_name}}",
    defaultBody: `Hi {{visitor_name}},

Thanks for reaching out to {{company_name}}. We're glad you're here.

If you ever want to continue the conversation, you can [jump back in here]({{conversation_link}}).

Best,
{{team_name}}`
  },
  follow_up_email: {
    key: "follow_up_email",
    name: "Follow-up email",
    description: "Sent after a conversation ends",
    trigger: "Manual or scheduled",
    icon: "follow_up",
    defaultSubject: "Checking in from {{team_name}}",
    defaultBody: `Hi {{visitor_name}},

Just checking in after your chat with {{agent_name}}.

If anything else comes up, you can [continue the conversation here]({{conversation_link}}).

Thanks,
{{team_name}}`
  },
  satisfaction_survey: {
    key: "satisfaction_survey",
    name: "Satisfaction survey",
    description: "Request feedback after resolution",
    trigger: "Automatic after resolve",
    icon: "survey",
    defaultSubject: "How did we do?",
    defaultBody: `Thanks for chatting with {{team_name}}.

We'd love your feedback on your recent conversation with {{agent_name}}.

If you'd like to [continue the conversation]({{conversation_link}}).`
  }
};

export const TEMPLATE_ORDER: DashboardEmailTemplateKey[] = [
  "offline_reply",
  "conversation_transcript",
  "welcome_email",
  "follow_up_email",
  "satisfaction_survey"
];

export function buildDefaultDashboardEmailTemplate(
  key: DashboardEmailTemplateKey
): DashboardEmailTemplate {
  const definition = TEMPLATE_DEFINITIONS[key];

  return {
    key,
    name: definition.name,
    description: definition.description,
    trigger: definition.trigger,
    icon: definition.icon,
    subject: definition.defaultSubject,
    body: definition.defaultBody,
    enabled: true,
    updatedAt: null
  };
}

export function getDefaultDashboardEmailTemplates() {
  return TEMPLATE_ORDER.map((key) => buildDefaultDashboardEmailTemplate(key));
}
