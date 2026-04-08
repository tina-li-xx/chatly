import {
  type Align,
  type ChattingEmailButton,
  type ChattingEmailMetric,
  renderBrandLockup,
  renderButtonRow,
  renderChattingEmailShell,
  renderDivider,
  renderEmailSection
} from "@/lib/chatting-email-core";
import {
  renderAlignedBlock,
  renderHeadingBlock,
  renderMetricGrid,
  renderPanel,
  renderParagraph,
  renderStack
} from "@/lib/chatting-email-content";
import { FONT_STACK } from "@/lib/chatting-email-tokens";
import { initialsFromLabel } from "@/lib/user-display";
import { escapeHtml } from "@/lib/utils";

type ChattingEmailHero = { label: string; avatarUrl?: string | null; badgeLabel?: string; size?: 48 | 64; shape?: "circle" | "tile" };
type ChattingEmailPageSection =
  | { kind: "copy" | "html"; html: string; align?: Align; padding?: string; background?: string; borderTopColor?: string; borderBottomColor?: string }
  | { kind: "panel"; html: string; padding?: string; align?: Align; background?: string; borderTopColor?: string; borderBottomColor?: string; panelPadding?: string; panelBackground?: string; panelBorderColor?: string }
  | { kind: "metrics"; metrics: ChattingEmailMetric[]; padding?: string };

export function renderEmailAvatar(input: ChattingEmailHero) {
  const size = input.size ?? 48;
  const shape = input.shape ?? "circle";
  const radius = shape === "circle" ? "50%" : "18px";

  if (input.avatarUrl && /^(data:|cid:)/i.test(input.avatarUrl)) {
    return `<img src="${input.avatarUrl}" alt="${escapeHtml(input.label)} avatar" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border-radius:${radius};object-fit:cover;border:0;" />`;
  }

  const fontSize = size === 64 ? 32 : 18;
  const fallback = input.badgeLabel ?? initialsFromLabel(input.label);
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="${size}" height="${size}" style="width:${size}px;height:${size}px;border-radius:${radius};background:#DBEAFE;"><tr><td align="center" valign="middle" style="font:600 ${fontSize}px ${FONT_STACK};line-height:1;color:#1D4ED8;">${escapeHtml(fallback)}</td></tr></table>`;
}

function renderPageSection(section: ChattingEmailPageSection) {
  if (section.kind === "metrics") {
    return renderEmailSection(renderMetricGrid(section.metrics), { padding: section.padding ?? "0 26px 24px" });
  }

  const content =
    section.kind === "panel"
      ? renderPanel(section.html, {
          padding: section.panelPadding,
          background: section.panelBackground,
          borderColor: section.panelBorderColor
        })
      : section.kind === "copy"
        ? renderParagraph(section.html, section.align)
        : section.html;

  return renderEmailSection(content, {
    align: section.align,
    padding: section.padding,
    background: section.background,
    borderTopColor: section.borderTopColor,
    borderBottomColor: section.borderBottomColor
  });
}

export function renderChattingEmailPage(input: {
  preheader: string;
  brandLabel?: string;
  title: string;
  eyebrow?: string;
  meta?: string;
  description?: string;
  align?: Align;
  hero?: ChattingEmailHero | null;
  sections?: ChattingEmailPageSection[];
  actions?: { message?: string; primary?: ChattingEmailButton | null; secondary?: ChattingEmailButton | null; customHtml?: string; padding?: string; borderTopColor?: string } | null;
  postActionsRowHtml?: string | null;
}) {
  const align = input.align ?? "left";
  const headingHtml = renderHeadingBlock({
    title: input.title,
    eyebrow: input.eyebrow,
    meta: input.meta,
    description: input.description,
    align
  });
  const heroHtml = renderStack(
    [input.hero ? renderAlignedBlock(renderEmailAvatar(input.hero), align) : null, headingHtml],
    { gap: "16px", align }
  );
  const actionBody = input.actions?.customHtml ?? renderButtonRow({ primary: input.actions?.primary, secondary: input.actions?.secondary });
  const actionHtml =
    input.actions && (input.actions.message || actionBody.trim())
      ? renderEmailSection(
          renderStack(
            [input.actions.message ? renderParagraph(escapeHtml(input.actions.message), "center") : null, actionBody],
            { gap: input.actions.message ? "20px" : "0", align: "center" }
          ),
          { align: "center", padding: input.actions.padding ?? "32px", borderTopColor: input.actions.borderTopColor }
        )
      : "";

  return renderChattingEmailShell({
    preheader: input.preheader,
    rows: [
      renderEmailSection(renderBrandLockup(input.brandLabel)),
      renderDivider(),
      renderEmailSection(heroHtml, { align, padding: "32px 32px 24px" }),
      ...(input.sections ?? []).map(renderPageSection),
      actionHtml,
      input.postActionsRowHtml ?? ""
    ].filter(Boolean)
  });
}
