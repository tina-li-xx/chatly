import { FONT_STACK, COMPANY_LEGAL_LINES } from "@/lib/chatly-email-tokens";
import { escapeHtml } from "@/lib/utils";

export type Align = "left" | "center" | "right";
export type ChattingEmailButton = { href: string; label: string; variant?: "primary" | "secondary" };
export type ChattingEmailMetric = { value: string; label: string };

function joinStyle(values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(";");
}

function renderCompanyLegalFooterHtml() {
  return `<tr><td align="center" style="padding:20px 32px 24px;border-top:1px solid #E2E8F0;background:#F8FAFC;"><div style="font:400 12px/1.7 ${FONT_STACK};color:#94A3B8;">${COMPANY_LEGAL_LINES.map((line) => escapeHtml(line)).join("<br />")}</div></td></tr>`;
}

export function renderChattingEmailShell(input: { preheader: string; rows: string[] }) {
  const preheader = escapeHtml(input.preheader);

  return [
    `<div style="display:none;overflow:hidden;line-height:1px;max-height:0;max-width:0;opacity:0;color:transparent;">${preheader}</div>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:0;padding:0;background:#F1F5F9;">`,
    `<tr><td align="center" style="padding:40px 20px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;">`,
    ...input.rows,
    renderCompanyLegalFooterHtml(),
    `</table>`,
    `</td></tr>`,
    `</table>`
  ].join("");
}

export function renderEmailSection(
  content: string,
  options?: {
    align?: Align;
    padding?: string;
    background?: string;
    borderTopColor?: string;
    borderBottomColor?: string;
  }
) {
  return `<tr><td align="${options?.align ?? "left"}" style="${joinStyle([
    `padding:${options?.padding ?? "32px"}`,
    options?.background ? `background:${options.background}` : null,
    options?.borderTopColor ? `border-top:1px solid ${options.borderTopColor}` : null,
    options?.borderBottomColor ? `border-bottom:1px solid ${options.borderBottomColor}` : null
  ])}">${content}</td></tr>`;
}

export function renderBrandLockup(label = "Chatting") {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:36px;height:36px;border-radius:12px;background:#2563EB;color:#FFFFFF;font:700 18px ${FONT_STACK};text-align:center;">C</td><td style="padding-left:12px;font:600 15px ${FONT_STACK};color:#0F172A;">${escapeHtml(label)}</td></tr></table></td></tr></table>`;
}

export const renderDivider = (spacing = "0 32px") =>
  `<tr><td style="padding:${spacing};"><div style="height:1px;background:#E2E8F0;font-size:0;line-height:0;">&nbsp;</div></td></tr>`;

export function renderEmailButton(button: ChattingEmailButton) {
  const safeLabel = escapeHtml(button.label);
  const style =
    (button.variant ?? "primary") === "secondary"
      ? joinStyle(["display:inline-block", `font:500 14px ${FONT_STACK}`, "color:#2563EB", "white-space:nowrap", "word-break:keep-all", "text-decoration:none"])
      : joinStyle(["display:inline-block", "padding:12px 24px", "border-radius:6px", "background:#2563EB", `font:500 14px ${FONT_STACK}`, "line-height:1", "color:#FFFFFF", "white-space:nowrap", "word-break:keep-all", "text-decoration:none"]);

  return `<a href="${button.href}" style="${style}">${safeLabel}</a>`;
}

export function renderButtonRow(input: {
  primary?: ChattingEmailButton | null;
  secondary?: ChattingEmailButton | null;
  secondaryPrefix?: string;
}) {
  const primary = input.primary ? renderEmailButton(input.primary) : "";
  const secondary = input.secondary
    ? `<span style="display:inline-block;padding:12px 10px 0;font:400 14px ${FONT_STACK};color:#475569;">${escapeHtml(input.secondaryPrefix ?? "or")}</span>${renderEmailButton({ ...input.secondary, variant: "secondary" })}`
    : "";

  return `<div style="text-align:center;">${primary}${secondary}</div>`;
}

export function renderFooterBlock(input: { text: string; links?: Array<{ label: string; href: string }> }) {
  const links = (input.links ?? [])
    .map((link) => `<a href="${link.href}" style="font:400 12px/1.6 ${FONT_STACK};color:#64748B;text-decoration:underline;">${escapeHtml(link.label)}</a>`)
    .join(`<span style="font:400 12px/1.6 ${FONT_STACK};color:#94A3B8;"> &bull; </span>`);

  return `<div style="text-align:center;"><div style="font:400 12px/1.6 ${FONT_STACK};color:#94A3B8;">${escapeHtml(input.text).replace(/\n/g, "<br />")}</div>${links ? `<div style="margin-top:8px;">${links}</div>` : ""}</div>`;
}

export const joinEmailText = (blocks: Array<string | null | undefined>) =>
  blocks.map((block) => block?.trim()).filter(Boolean).join("\n\n");

export function appendChattingCompanyLegalText(bodyText: string) {
  const trimmed = bodyText.trim();
  return trimmed.includes("Company No. 16998528") ? trimmed : [trimmed, ...COMPANY_LEGAL_LINES].filter(Boolean).join("\n\n");
}
