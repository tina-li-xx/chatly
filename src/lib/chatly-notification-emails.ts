import {
  joinEmailText,
  renderChattingEmailPage,
  renderPanel
} from "@/lib/chatly-email-foundation";
import { escapeHtml } from "@/lib/utils";
type RenderedEmail = { subject: string; bodyText: string; bodyHtml: string };

export function renderNewMessageNotificationEmail(input: {
  visitorName: string;
  visitorEmail: string | null;
  currentPage: string | null;
  messagePreview: string;
  replyNowUrl: string;
  inboxUrl: string;
  workspaceName?: string;
  attachmentsCount?: number;
  upgradePromptHtml?: string;
  upgradePromptText?: string;
}): RenderedEmail {
  const meta = [input.visitorEmail || "Unknown email", input.currentPage || "Unknown page"].join(" • ");
  const workspaceMeta =
    input.workspaceName || typeof input.attachmentsCount === "number"
      ? [`Workspace: ${input.workspaceName ?? "Unknown workspace"}`, `Attachments: ${input.attachmentsCount ?? 0}`].join(
          "\n"
        )
      : "";
  return {
    subject: `New message from ${input.visitorName}`,
    bodyText: joinEmailText([
      `New message from ${input.visitorName}`,
      meta,
      `"${input.messagePreview}"`,
      `Reply Now: ${input.replyNowUrl}`,
      `View in Inbox: ${input.inboxUrl}`,
      "Tip: Reply directly to this email to respond.",
      workspaceMeta,
      input.upgradePromptText
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: `"${input.messagePreview}" — Reply now or view in inbox.`,
      title: `New message from ${input.visitorName}`,
      meta,
      sections: [
        {
          kind: "panel",
          html: `<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0F172A;">&ldquo;${escapeHtml(
            input.messagePreview
          )}&rdquo;</div>`,
          padding: "0 32px 32px"
        },
        {
          kind: "html",
          html: `<div style="text-align:center;font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">&#128161; Tip: Reply directly to this email to respond.</div>${workspaceMeta ? `<div style="margin-top:12px;text-align:center;font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">${escapeHtml(workspaceMeta).replace(/\n/g, "<br />")}</div>` : ""}${input.upgradePromptHtml ?? ""}`,
          padding: "0 32px 32px"
        }
      ],
      actions: {
        primary: { href: input.replyNowUrl, label: "Reply Now" },
        secondary: { href: input.inboxUrl, label: "View in Inbox" },
        padding: "0 32px 24px",
        borderTopColor: undefined
      }
    })
  };
}

export function renderDailyDigestEmail(input: {
  date: string;
  metrics: Array<{ value: string; label: string }>;
  openConversations: Array<{ title: string; preview: string; meta: string }>;
  inboxUrl: string;
}): RenderedEmail {
  const openItems = input.openConversations.map((item) => `${item.title}\n${item.preview}\n${item.meta}`).join("\n\n");
  const openHtml = input.openConversations
    .map(
      (item) =>
        `<div style="margin-top:12px;">${renderPanel(
          `<div style="font:600 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0F172A;">${escapeHtml(
            item.title
          )}</div><div style="margin-top:4px;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
            item.preview
          )}</div><div style="margin-top:6px;font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">${escapeHtml(
            item.meta
          )}</div>`,
          { padding: "16px" }
        )}</div>`
    )
    .join("");

  return {
    subject: `Your daily Chatting digest — ${input.date}`,
    bodyText: joinEmailText([
      `Your daily digest\n${input.date}`,
      input.metrics.map((metric) => `${metric.value} ${metric.label}`).join("\n"),
      openItems,
      `Go to Inbox → ${input.inboxUrl}`
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: `Your Chatting activity snapshot for ${input.date}.`,
      title: "Your daily digest",
      meta: input.date,
      sections: [
        { kind: "metrics", metrics: input.metrics, padding: "0 26px 20px" },
        {
          kind: "html",
          html: `<div style="font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Open conversations</div>${openHtml}`,
          padding: "0 32px 32px"
        }
      ],
      actions: { primary: { href: input.inboxUrl, label: "Go to Inbox \u2192" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}

export function renderMentionNotificationEmail(input: {
  mentionerName: string;
  visitorName: string;
  note: string;
  noteMeta: string;
  conversationUrl: string;
}): RenderedEmail {
  return {
    subject: `${input.mentionerName} mentioned you in a conversation`,
    bodyText: joinEmailText([
      `${input.mentionerName} mentioned you`,
      `In conversation with ${input.visitorName}:`,
      `${input.note}\n${input.noteMeta}`,
      `View Conversation: ${input.conversationUrl}`
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: `${input.mentionerName} mentioned you in a conversation with ${input.visitorName}.`,
      title: `${input.mentionerName} mentioned you`,
      sections: [
        {
          kind: "panel",
          html: `<div style="font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">In conversation with ${escapeHtml(
            input.visitorName
          )}:</div><div style="margin-top:14px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0F172A;">${escapeHtml(
            input.note
          )}</div><div style="margin-top:10px;font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">${escapeHtml(
            input.noteMeta
          )}</div>`,
          padding: "0 32px 32px"
        }
      ],
      actions: { primary: { href: input.conversationUrl, label: "View Conversation" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}

export function renderWeeklyPerformanceEmail(input: {
  dateRange: string;
  highlights: string[];
  busiestHours: string;
  topPages: string[];
  reportUrl: string;
}): RenderedEmail {
  return {
    subject: `Your week in chat — ${input.dateRange}`,
    bodyText: joinEmailText([
      `Your week in chat\n${input.dateRange}`,
      "Highlights:\n" + input.highlights.join("\n"),
      `Busiest hours:\n${input.busiestHours}`,
      "Top pages generating chats:\n" + input.topPages.join("\n"),
      `View Full Report → ${input.reportUrl}`
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: `Weekly conversation highlights for ${input.dateRange}.`,
      title: "Your week in chat",
      meta: input.dateRange,
      sections: [
        {
          kind: "panel",
          html: input.highlights.map((item) => `<div style="margin-top:10px;">${escapeHtml(item)}</div>`).join(""),
          padding: "0 32px 20px"
        },
        {
          kind: "panel",
          html: `<div style="font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Busiest hours</div><div style="margin-top:10px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
            input.busiestHours
          )}</div><div style="margin-top:18px;font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Top pages generating chats</div><div style="margin-top:10px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${input.topPages
            .map((item) => `<div style="margin-top:8px;">${escapeHtml(item)}</div>`)
            .join("")}</div>`,
          padding: "0 32px 32px"
        }
      ],
      actions: { primary: { href: input.reportUrl, label: "View Full Report \u2192" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}
