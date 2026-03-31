import type { DashboardHomeGrowthData } from "@/lib/data/dashboard-growth-types";
import type { GrowthOutreachPlanKey } from "@/lib/growth-outreach-rules";
import {
  joinEmailText,
  renderChattingEmailPage
} from "@/lib/chatly-email-foundation";
import { sendRichEmail } from "@/lib/email";
import { getPublicAppUrl } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";

function appUrl(path: string) {
  return `${getPublicAppUrl()}${path}`;
}

function renderLifecycleReminderEmail(input: {
  eyebrow: string;
  subject: string;
  preheader: string;
  description: string;
  detailLabel: string;
  detailValue: string;
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  } | null;
}) {
  return {
    bodyText: joinEmailText([
      input.subject,
      input.description,
      `${input.detailLabel}: ${input.detailValue}`,
      `${input.primaryAction.label}: ${input.primaryAction.href}`,
      input.secondaryAction ? `${input.secondaryAction.label}: ${input.secondaryAction.href}` : undefined
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: input.preheader,
      eyebrow: input.eyebrow,
      title: input.subject,
      description: input.description,
      sections: [
        {
          kind: "panel",
          html: `<div style="font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">${escapeHtml(
            input.detailLabel
          )}</div><div style="margin-top:10px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
            input.detailValue
          )}</div>`,
          padding: "0 32px 24px"
        }
      ],
      actions: {
        primary: input.primaryAction,
        secondary: input.secondaryAction ?? null,
        padding: "0 32px 32px",
        borderTopColor: undefined
      }
    })
  };
}

export async function sendActivationReminderEmail(input: {
  to: string;
  siteName: string;
  pageUrl: string | null;
  mode: "live" | "missed";
}) {
  const subject =
    input.mode === "live"
      ? "Your widget is live. Let's land the first chat today."
      : "Your widget is installed, but the first chat still hasn't happened";
  const widgetUrl = appUrl("/dashboard/widget");
  const analyticsUrl = appUrl("/dashboard/analytics");
  const detailValue = input.pageUrl ? input.pageUrl : "Put the widget on pricing, demo, or contact pages.";
  const description =
    input.mode === "live"
      ? "Tighten the welcome message, place the widget on a high-intent page, and send yourself a test message."
      : "Move the widget to a higher-intent page and sharpen the opener so the first reply loop starts faster.";
  const rendered = renderLifecycleReminderEmail({
    eyebrow: "Activation reminder",
    subject,
    preheader: subject,
    description,
    detailLabel: input.pageUrl ? "Last seen on" : "Recommended placement",
    detailValue,
    primaryAction: {
      href: widgetUrl,
      label: "Open widget settings"
    },
    secondaryAction: {
      href: analyticsUrl,
      label: "Open analytics"
    }
  });

  await sendRichEmail({
    to: input.to,
    subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendHealthReminderEmail(input: {
  to: string;
  score: number;
  health: DashboardHomeGrowthData["health"];
}) {
  const actionUrl = appUrl(input.health.action.href);
  const subject = `Your workspace health score dropped to ${input.score}`;
  const rendered = renderLifecycleReminderEmail({
    eyebrow: "Workspace health",
    subject,
    preheader: subject,
    description: input.health.description,
    detailLabel: "Next step",
    detailValue: input.health.action.label,
    primaryAction: {
      href: actionUrl,
      label: input.health.action.label
    }
  });

  await sendRichEmail({
    to: input.to,
    subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}

export async function sendExpansionReminderEmail(input: {
  to: string;
  planKey: GrowthOutreachPlanKey;
  mode: "team" | "analytics";
  usedSeats: number;
  conversationCount: number;
}) {
  const billingUrl = appUrl("/dashboard/settings?section=billing");
  const subject =
    input.mode === "team"
      ? "Your workspace is growing beyond Starter"
      : "You may be ready for deeper analytics and API access";
  const intro =
    input.mode === "team"
      ? `You now have ${input.usedSeats} reserved seats in play. As the inbox becomes a team workflow, moving beyond Starter keeps coverage and reporting from getting cramped.`
      : `Your workspace is showing signs that a paid plan could help: ${input.conversationCount} conversations this month and enough activity to benefit from fuller analytics and API access.`;
  const rendered = renderLifecycleReminderEmail({
    eyebrow: input.mode === "team" ? "Team growth" : "Analytics growth",
    subject,
    preheader: subject,
    description: intro,
    detailLabel: input.mode === "team" ? "Reserved seats" : "Conversations this month",
    detailValue: input.mode === "team" ? String(input.usedSeats) : String(input.conversationCount),
    primaryAction: {
      href: billingUrl,
      label: "Review plans"
    }
  });

  await sendRichEmail({
    to: input.to,
    subject,
    bodyText: rendered.bodyText,
    bodyHtml: rendered.bodyHtml
  });
}
