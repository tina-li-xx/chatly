import { joinEmailText, renderChattingEmailPage, renderLabelText, renderPanel, renderSmallText, renderStack, renderTextBlock } from "@/lib/chatting-email-foundation";
import { escapeHtml } from "@/lib/utils";
export { renderWeeklyPerformanceEmail } from "@/lib/chatting-weekly-performance-email";
type RenderedEmail = { subject: string; bodyText: string; bodyHtml: string };

function isHostedConversationPage(value: string | null) {
  if (!value) return false;
  try {
    return new URL(value).pathname.startsWith("/conversation/");
  } catch {
    return value.startsWith("/conversation/");
  }
}

function formatNotificationPageLabel(value: string) {
  try {
    const { host, pathname } = new URL(value);
    return pathname === "/" ? host : `${host}${pathname}`;
  } catch {
    return value;
  }
}

function renderNotificationMeta(visitorEmail: string | null, currentPage: string | null) {
  const visitor = escapeHtml(visitorEmail || "Unknown email");

  if (!currentPage || isHostedConversationPage(currentPage)) {
    return visitor;
  }
  try {
    const pageUrl = new URL(currentPage);
    if (!/^https?:$/i.test(pageUrl.protocol)) {
      return `${visitor} <span style="color:#94A3B8;">&bull;</span> Current page: ${escapeHtml(currentPage)}`;
    }
    const pageLabel = escapeHtml(formatNotificationPageLabel(currentPage));
    const href = escapeHtml(pageUrl.toString());
    return `${visitor} <span style="color:#94A3B8;">&bull;</span> Current page: <a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#2563EB;text-decoration:underline;">${pageLabel}</a>`;
  } catch {
    return `${visitor} <span style="color:#94A3B8;">&bull;</span> Current page: ${escapeHtml(currentPage)}`;
  }
}

export function renderNewMessageNotificationEmail(input: {
  visitorName: string;
  visitorEmail: string | null;
  currentPage: string | null;
  messagePreview: string;
  replyNowUrl: string;
  inboxUrl: string;
  workspaceName?: string;
  attachmentsCount?: number;
  replyByEmailEnabled?: boolean;
  upgradePromptHtml?: string;
  upgradePromptText?: string;
}): RenderedEmail {
  const replyByEmailEnabled = input.replyByEmailEnabled ?? input.replyNowUrl.startsWith("mailto:");
  const primaryActionUrl = replyByEmailEnabled ? input.replyNowUrl : input.inboxUrl;
  const primaryActionLabel = replyByEmailEnabled ? "Reply Now" : "Open Inbox";
  const tipText = replyByEmailEnabled
    ? "Tip: Reply directly to this email to respond."
    : "Tip: Open the inbox to respond.";
  const pageMeta = input.currentPage ? (!isHostedConversationPage(input.currentPage) ? `Current page: ${input.currentPage}` : null) : "Unknown page";
  const meta = [input.visitorEmail || "Unknown email", pageMeta].filter(Boolean).join(" • ");
  const workspaceMeta =
    input.workspaceName || typeof input.attachmentsCount === "number" ? [`Workspace: ${input.workspaceName ?? "Unknown workspace"}`, `Attachments: ${input.attachmentsCount ?? 0}`].join("\n") : "";
  return {
    subject: `New message from ${input.visitorName}`,
    bodyText: joinEmailText([
      `New message from ${input.visitorName}`,
      meta,
      `"${input.messagePreview}"`,
      `${primaryActionLabel}: ${primaryActionUrl}`,
      replyByEmailEnabled ? `View in Inbox: ${input.inboxUrl}` : "",
      tipText,
      workspaceMeta,
      input.upgradePromptText
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: replyByEmailEnabled
        ? `"${input.messagePreview}" — Reply now or view in inbox.`
        : `"${input.messagePreview}" — Open in inbox to respond.`,
      title: `New message from ${input.visitorName}`,
      meta,
      metaHtml: renderNotificationMeta(input.visitorEmail, input.currentPage),
      sections: [
        {
          kind: "panel",
          html: renderTextBlock({
            html: `&ldquo;${escapeHtml(input.messagePreview)}&rdquo;`,
            color: "#0F172A"
          }),
          padding: "0 32px 32px"
        },
        {
          kind: "html",
          html: renderStack(
            [
              renderSmallText(`&#128161; ${escapeHtml(tipText)}`, "center"),
              workspaceMeta ? renderSmallText(escapeHtml(workspaceMeta).replace(/\n/g, "<br />"), "center") : null,
              input.upgradePromptHtml ?? null
            ],
            { gap: "12px", align: "center" }
          ),
          padding: "0 32px 32px"
        }
      ],
      actions: {
        primary: { href: primaryActionUrl, label: primaryActionLabel },
        secondary: replyByEmailEnabled ? { href: input.inboxUrl, label: "View in Inbox" } : null,
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
  const openHtml = input.openConversations.map((item) =>
    renderPanel(
      renderStack(
        [
          renderTextBlock({ html: escapeHtml(item.title), color: "#0F172A", fontSize: 14, lineHeight: "1.5", fontWeight: 600 }),
          renderTextBlock({ html: escapeHtml(item.preview), fontSize: 14, lineHeight: "1.6" }),
          renderSmallText(escapeHtml(item.meta))
        ],
        { gap: "6px" }
      ),
      { padding: "16px" }
    )
  );

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
          html: renderStack([renderLabelText("Open conversations"), ...openHtml], { gap: "12px" }),
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
          html: renderStack(
            [
              renderTextBlock({ html: `In conversation with ${escapeHtml(input.visitorName)}:`, color: "#64748B", fontSize: 13, lineHeight: "1.5", fontWeight: 600 }),
              renderTextBlock({ html: escapeHtml(input.note), color: "#0F172A" }),
              renderSmallText(escapeHtml(input.noteMeta))
            ],
            { gap: "10px" }
          ),
          padding: "0 32px 32px"
        }
      ],
      actions: { primary: { href: input.conversationUrl, label: "View Conversation" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}
