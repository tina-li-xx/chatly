import type { ConversationFeedbackLink } from "@/lib/conversation-feedback";
import { escapeHtml } from "@/lib/utils";

const FONT_STACK = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export function renderConversationFeedbackScale(links: ConversationFeedbackLink[]) {
  const cells = links
    .map(
      (link) =>
        `<td width="20%" style="padding:0 4px;vertical-align:top;"><a href="${link.href}" style="display:block;border:1px solid #CBD5E1;border-radius:14px;padding:14px 8px;background:#FFFFFF;color:#0F172A;text-decoration:none;text-align:center;"><div style="font:700 20px/1 ${FONT_STACK};">${link.rating}</div><div style="margin-top:8px;font:500 12px/1.4 ${FONT_STACK};color:#475569;">${escapeHtml(
          link.label
        )}</div></a></td>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

export function renderConversationFeedbackText(links: ConversationFeedbackLink[]) {
  return links.map((link) => `${link.label}: ${link.href}`).join("\n");
}
