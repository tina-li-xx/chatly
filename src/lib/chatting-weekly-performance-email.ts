import { joinEmailText, renderChattingEmailPage, renderLabelText, renderPanel, renderParagraph, renderSmallText, renderStack, renderTextBlock } from "@/lib/chatting-email-foundation";
import { escapeHtml } from "@/lib/utils";
import type { WeeklyPerformanceEmailInput, WeeklyPerformanceMetric, WeeklyPerformanceTeamPerformance } from "@/lib/weekly-performance-types";

type RenderedEmail = { subject: string; bodyText: string; bodyHtml: string };
type WeeklyEmailSection = NonNullable<Parameters<typeof renderChattingEmailPage>[0]["sections"]>[number];

const HEATMAP_COLORS = { empty: "#F1F5F9", low: "#DBEAFE", medium: "#93C5FD", high: "#3B82F6", peak: "#1D4ED8" } as const;

function trendColor(metric: WeeklyPerformanceMetric) {
  if (metric.trendTone === "positive") return "#10B981";
  if (metric.trendTone === "negative") return "#EF4444";
  return "#94A3B8";
}

function joinStatParts(parts: Array<string | null | undefined>) { return parts.filter(Boolean).join(" · "); }

function teamMemberLabel(row: WeeklyPerformanceTeamPerformance, recipientUserId: string) {
  return row.userId === recipientUserId ? "You" : row.name;
}

function teamMemberStats(row: WeeklyPerformanceTeamPerformance) { return joinStatParts([row.conversationsLabel, row.avgResponseLabel, row.resolutionLabel, row.satisfactionLabel]); }

function metricCards(metrics: WeeklyPerformanceEmailInput["metrics"]) {
  const cells = metrics.map((metric) => `<td width="50%" valign="top" style="padding:0 8px 16px;">${renderPanel(renderStack([renderLabelText(escapeHtml(metric.label)), renderTextBlock({ html: escapeHtml(metric.value), color: "#0F172A", fontSize: 28, lineHeight: "1.1", fontWeight: 600 }), renderSmallText(escapeHtml(metric.trendLabel), "left", trendColor(metric))], { gap: "8px" }), { padding: "18px", background: "#FFFFFF" })}</td>`);
  const rows = [];
  for (let index = 0; index < cells.length; index += 2) rows.push(`<tr>${cells[index] ?? '<td width="50%"></td>'}${cells[index + 1] ?? '<td width="50%"></td>'}</tr>`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;">${rows.join("")}</table>`;
}

function heatmap(input: WeeklyPerformanceEmailInput) {
  const header = input.heatmapHours.map((hour) => `<td align="center" style="padding:0 0 8px;font:500 11px/1.3 DM Sans,system-ui,sans-serif;color:#64748B;">${hour}</td>`).join("");
  const rows = input.heatmapRows.map((row) => `<tr><td style="padding:0 10px 6px 0;font:500 12px/1.3 DM Sans,system-ui,sans-serif;color:#475569;">${row.label}</td>${row.cells.map((cell) => `<td style="padding:0 0 6px;"><table role="presentation" cellpadding="0" cellspacing="0" width="20" height="20" style="width:20px;height:20px;border-radius:4px;background:${HEATMAP_COLORS[cell.intensity]};"><tr><td></td></tr></table></td>`).join("")}</tr>`).join("");
  return renderPanel(renderStack([renderLabelText("Busiest hours"), `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td></td>${header}</tr>${rows}</table>`, renderSmallText(input.peakLabel ? `Peak: ${escapeHtml(input.peakLabel)}` : "No conversation spikes recorded in this window.")], { gap: "14px" }), { padding: "20px", background: "#FFFFFF" });
}

function topPages(pages: WeeklyPerformanceEmailInput["topPages"]) {
  if (!pages.length) return renderPanel(renderStack([renderLabelText("Top pages generating chats"), renderParagraph("No page-level conversation sources were recorded this week.")], { gap: "10px" }), { padding: "20px", background: "#FFFFFF" });
  return renderPanel(renderStack([renderLabelText("Top pages generating chats"), ...pages.map((page, index) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td style="padding-bottom:6px;font:500 14px/1.5 DM Sans,system-ui,sans-serif;color:#0F172A;">${index + 1}. ${escapeHtml(page.label)}</td><td align="right" style="padding-bottom:6px;font:500 13px/1.5 DM Sans,system-ui,sans-serif;color:#475569;">${page.count} conversations</td></tr><tr><td colspan="2"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#F1F5F9;border-radius:999px;"><tr><td width="${page.widthPercent}%" style="height:8px;border-radius:999px;background:#3B82F6;"></td><td></td></tr></table></td></tr></table>`)], { gap: "12px" }), { padding: "20px", background: "#FFFFFF" });
}

function personalStats(input: WeeklyPerformanceEmailInput) {
  if (!input.personalPerformance) return null;
  return {
    kind: "panel" as const,
    html: renderStack([renderLabelText("Your stats"), renderParagraph(escapeHtml(joinStatParts([input.personalPerformance.conversationsLabel, input.personalPerformance.avgResponseLabel, input.personalPerformance.resolutionLabel, input.personalPerformance.satisfactionLabel]))), renderSmallText(`Team average: ${escapeHtml(input.personalPerformance.teamAverageLabel)}`)], { gap: "10px" }),
    padding: "0 32px 20px",
    panelBackground: "#FFFFFF"
  };
}

function teamPerformanceRows(rows: WeeklyPerformanceTeamPerformance[], recipientUserId: string) {
  if (!rows.length) return "";
  return renderPanel(renderStack([renderLabelText("Team performance"), ...rows.map((row) => renderPanel(renderStack([renderTextBlock({ html: escapeHtml(teamMemberLabel(row, recipientUserId)), color: "#0F172A", fontSize: 16, lineHeight: "1.4", fontWeight: 600 }), renderSmallText(teamMemberStats(row))], { gap: "6px" }), { padding: "14px 16px", background: row.userId === recipientUserId ? "#EFF6FF" : "#FFFFFF" }))], { gap: "12px" }), { padding: "20px", background: "#FFFFFF" });
}

function quietWeekBodyText(input: WeeklyPerformanceEmailInput) {
  return joinEmailText([
    `Your week in chat\n${input.dateRange}`,
    "Quiet week — no conversations.",
    "Your widget is installed and ready. Review your widget settings, proactive welcome message, or saved replies before traffic picks up again.",
    `Check Widget Settings → ${input.widgetUrl}`
  ]);
}

function reportBodyText(input: WeeklyPerformanceEmailInput) {
  return joinEmailText([
    `Your week in chat\n${input.dateRange}`,
    input.metrics.map((metric) => `${metric.label}: ${metric.value} (${metric.trendLabel})`).join("\n"),
    input.peakLabel ? `Busiest hours:\nPeak: ${input.peakLabel}` : "Busiest hours:\nNo spikes recorded",
    "Top pages generating chats:\n" + (input.topPages.map((page) => `${page.label} — ${page.count} conversations`).join("\n") || "None recorded"),
    input.personalPerformance
      ? `Your stats:\n${joinStatParts([
          input.personalPerformance.conversationsLabel,
          input.personalPerformance.avgResponseLabel,
          input.personalPerformance.resolutionLabel,
          input.personalPerformance.satisfactionLabel
        ])}\nTeam average: ${input.personalPerformance.teamAverageLabel}`
      : null,
    input.teamPerformance.length
      ? "Team performance:\n" +
        input.teamPerformance
          .map((row) => `${teamMemberLabel(row, input.recipientUserId)} — ${teamMemberStats(row)}`)
          .join("\n")
      : null,
    input.insight ? `Insight:\n${input.insight}` : null,
    `View Full Analytics → ${input.reportUrl}`,
    `${input.tip.text}\n${input.tip.label} → ${input.tip.href}`,
    `You're receiving this because you're on the ${input.teamName} team.`,
    `Manage email preferences → ${input.settingsUrl}`
  ]);
}

function quietWeekSections() {
  return [{ kind: "panel" as const, html: renderStack([renderTextBlock({ html: "Quiet week &mdash; no conversations", color: "#0F172A", fontSize: 22, lineHeight: "1.3", fontWeight: 600 }), renderParagraph("Your widget is installed and ready. Use the quiet week to tighten widget copy, saved replies, and page coverage before traffic picks up again."), renderSmallText("Open widget settings to review visibility, welcome copy, and proactive prompts.")], { gap: "12px" }), padding: "0 32px 28px", panelBackground: "#FFFFFF" }];
}

function reportSections(input: WeeklyPerformanceEmailInput) {
  const sections: WeeklyEmailSection[] = [
    { kind: "html" as const, html: metricCards(input.metrics), padding: "0 24px 16px" },
    { kind: "html" as const, html: heatmap(input), padding: "0 32px 20px" },
    { kind: "html" as const, html: topPages(input.topPages), padding: "0 32px 20px" }
  ];
  const personalSection = personalStats(input);
  if (personalSection) sections.push(personalSection);
  if (input.teamPerformance.length) {
    sections.push({
      kind: "html" as const,
      html: teamPerformanceRows(input.teamPerformance, input.recipientUserId),
      padding: "0 32px 20px"
    });
  }
  if (input.insight) {
    sections.push({ kind: "panel" as const, html: renderStack([renderLabelText("Insight"), renderParagraph(escapeHtml(input.insight))], { gap: "10px" }), padding: "0 32px 24px", panelBackground: "#FFFFFF" });
  }
  sections.push({ kind: "html" as const, html: renderSmallText(`You're receiving this because you're on the ${escapeHtml(input.teamName)} team.`, "center"), padding: "0 32px 20px" });
  return sections;
}

export function renderWeeklyPerformanceEmail(input: WeeklyPerformanceEmailInput): RenderedEmail {
  return {
    subject: `Your week in chat — ${input.dateRange}`,
    bodyText: input.quietWeek ? quietWeekBodyText(input) : reportBodyText(input),
    bodyHtml: renderChattingEmailPage({
      preheader: input.previewText,
      title: "Your week in chat",
      meta: input.dateRange,
      sections: input.quietWeek ? quietWeekSections() : reportSections(input),
      actions: {
        primary: { href: input.quietWeek ? input.widgetUrl : input.reportUrl, label: input.quietWeek ? "Check Widget Settings" : "View Full Analytics →" },
        secondary: { href: input.tip.href, label: input.tip.label },
        message: input.tip.text,
        padding: "0 32px 28px",
        borderTopColor: undefined
      }
    })
  };
}
