import {
  joinEmailText,
  renderButtonRow,
  renderChattingEmailPage,
  renderParagraph
} from "./chatly-email-foundation";
import { escapeHtml } from "./utils";

export type TeamNotificationUpgradePrompt = {
  conversationCount: number;
  conversationLimit: number;
  remainingConversations: number;
  billingUrl: string;
  limitReached: boolean;
};

type RenderedEmail = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
};

function buildPromptHeadline(prompt: TeamNotificationUpgradePrompt) {
  return prompt.limitReached
    ? `You've hit ${prompt.conversationCount} of ${prompt.conversationLimit} conversations this month`
    : `You're at ${prompt.conversationCount} of ${prompt.conversationLimit} conversations this month`;
}

function buildPromptBody(prompt: TeamNotificationUpgradePrompt) {
  if (prompt.limitReached) {
    return "Your free monthly cap is full. Upgrade to Growth to keep new chats flowing without interruptions.";
  }

  if (prompt.remainingConversations === 1) {
    return "You only have 1 conversation left before the free monthly cap kicks in. Upgrade now to stay ahead of it.";
  }

  return `Only ${prompt.remainingConversations} conversations remain before the free monthly cap kicks in. Upgrade now to stay ahead of it.`;
}

export function renderTeamNotificationUpgradePromptText(prompt: TeamNotificationUpgradePrompt) {
  return [
    "Starter usage alert",
    buildPromptHeadline(prompt),
    buildPromptBody(prompt),
    `Upgrade to Growth: ${prompt.billingUrl}`
  ].join("\n");
}

export function renderTeamNotificationUpgradePromptHtml(prompt: TeamNotificationUpgradePrompt) {
  return `<div style="margin-top:20px;border:1px solid #FCD34D;border-radius:16px;background:linear-gradient(135deg,#FFF7ED 0%,#FFFFFF 64%,#EFF6FF 100%);padding:18px 20px;"><div style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#B45309;">Starter usage alert</div><div style="margin-top:12px;font-size:16px;font-weight:600;line-height:1.4;color:#0F172A;">${escapeHtml(
    buildPromptHeadline(prompt)
  )}</div><div style="margin-top:8px;font-size:14px;line-height:1.7;color:#475569;">${escapeHtml(
    buildPromptBody(prompt)
  )}</div><div style="margin-top:16px;">${renderButtonRow({
    primary: { href: prompt.billingUrl, label: prompt.limitReached ? "Upgrade to reopen chats" : "Upgrade to Growth" }
  })}</div></div>`;
}

function buildUpgradeButtonLabel(prompt: TeamNotificationUpgradePrompt) {
  return prompt.limitReached ? "Upgrade to reopen chats" : "Upgrade to Growth";
}

function buildPreheader(prompt: TeamNotificationUpgradePrompt) {
  return prompt.limitReached
    ? "Your starter workspace has reached its monthly conversation cap."
    : `Your starter workspace is at ${prompt.conversationCount}/${prompt.conversationLimit} monthly conversations.`;
}

export function renderStarterUpgradePromptEmail(prompt: TeamNotificationUpgradePrompt): RenderedEmail {
  const headline = buildPromptHeadline(prompt);
  const body = buildPromptBody(prompt);
  const buttonLabel = buildUpgradeButtonLabel(prompt);
  const usageLabel = `${prompt.conversationCount}/${prompt.conversationLimit}`;
  const milestoneLabel = prompt.limitReached ? "Cap reached" : "Upgrade trigger";

  return {
    subject: prompt.limitReached
      ? `You've hit your ${prompt.conversationLimit}-conversation monthly cap`
      : `You're at ${prompt.conversationCount}/${prompt.conversationLimit} conversations this month`,
    bodyText: joinEmailText([
      "Starter usage alert",
      headline,
      body,
      `${usageLabel} conversations this month`,
      `${prompt.remainingConversations} remaining before cap`,
      `${buttonLabel}: ${prompt.billingUrl}`,
      "You're receiving this because your workspace crossed a monthly freemium usage milestone."
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: buildPreheader(prompt),
      eyebrow: "Starter usage alert",
      title: headline,
      description: body,
      sections: [
        {
          kind: "metrics",
          metrics: [
            { value: usageLabel, label: "Conversations this month" },
            { value: String(prompt.remainingConversations), label: "Remaining before cap" }
          ],
          padding: "0 26px 24px"
        },
        {
          kind: "panel",
          html: renderParagraph(
            `Growth removes the monthly cap, keeps new chats flowing, and unlocks proactive chat, branding removal, and deeper analytics.`
          ),
          padding: "0 32px 24px",
          panelBackground: "#EFF6FF",
          panelBorderColor: "#BFDBFE",
          panelPadding: "20px"
        }
      ],
      actions: { primary: { href: prompt.billingUrl, label: buttonLabel }, padding: "0 32px 24px", borderTopColor: undefined },
      footer: {
        text: `You're receiving this because your workspace crossed the ${milestoneLabel.toLowerCase()} monthly freemium usage milestone.`,
        padding: "0 32px 32px"
      }
    })
  };
}
