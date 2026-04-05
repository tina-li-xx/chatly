import { buildDashboardEmailTemplatePreviewLink } from "@/lib/email-template-preview";

function capitalizeWord(value: string) {
  if (!value) {
    return value;
  }

  return `${value[0]?.toUpperCase() || ""}${value.slice(1).toLowerCase()}`;
}

function companyNameFromEmail(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] || "";
  const root = domain.split(".")[0] || "chatly";
  const companyName = root
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => capitalizeWord(part))
    .join(" ");

  return !companyName || companyName.toLowerCase() === "chatly"
    ? "Chatting"
    : companyName;
}

function buildPreviewUnsubscribeLink(appUrl?: string) {
  const url = new URL("/email/unsubscribe", appUrl ?? "https://chatly.example");
  url.searchParams.set("token", "preview-unsubscribe-token");
  return url.toString();
}

export function buildDashboardEmailTemplatePreviewContext(input: {
  profileEmail: string;
  profileName: string;
  appUrl?: string;
}) {
  const companyName = companyNameFromEmail(input.profileEmail) || "Chatting";
  const agentName = input.profileName.trim().split(/\s+/)[0] || "Sarah";
  const teamName = companyName === "Chatting" ? "Chatting Team" : `${companyName} Support`;

  return {
    visitorName: "Alex",
    visitorEmail: "alex@example.com",
    teamName,
    agentName,
    companyName,
    conversationLink: buildDashboardEmailTemplatePreviewLink({
      appUrl: input.appUrl,
      teamName,
      agentName,
      companyName
    }),
    transcript: `Alex: Hi there\n${agentName}: Happy to help. What can I do for you?`,
    unsubscribeLink: buildPreviewUnsubscribeLink(input.appUrl)
  };
}

export function formatEmailTemplateTimestamp(value: string | null) {
  if (!value) {
    return "Default template";
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
