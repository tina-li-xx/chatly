import { Buffer } from "node:buffer";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { renderChattingEmailPage } from "@/lib/chatly-email-foundation";
import type { EmailAttachment } from "@/lib/email-mime";
import { getFreeToolBySlug } from "@/lib/free-tools-data";
import { formatPercentage, formatWholeCurrency, formatWholeNumber } from "@/lib/live-chat-roi";
import { resolvePrimaryBrandHelloMailFrom } from "@/lib/mail-from-addresses";
import { sendRenderedEmail } from "@/lib/rendered-email-delivery";
import { escapeHtml } from "@/lib/utils";

const supportedFreeToolExportSlugs = [
  "live-chat-roi-calculator",
  "response-time-calculator",
  "welcome-message-generator",
  "response-tone-checker"
] as const;

export function isSupportedFreeToolExportSlug(value: string) {
  return supportedFreeToolExportSlugs.includes(value as (typeof supportedFreeToolExportSlugs)[number]);
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function buildReport(toolSlug: string, payload: unknown) {
  const tool = getFreeToolBySlug(toolSlug);
  if (!tool || !isSupportedFreeToolExportSlug(toolSlug)) {
    throw new Error("UNSUPPORTED_TOOL_EXPORT");
  }

  const data = asRecord(payload);
  const result = asRecord(data.result);
  const analysis = asRecord(data.analysis);
  const lines =
    toolSlug === "live-chat-roi-calculator"
      ? [
          `Monthly visitors: ${formatWholeNumber(asNumber(data.monthlyVisitors))}`,
          `Current conversion rate: ${formatPercentage(asNumber(data.conversionRate))}`,
          `Average order value: ${formatWholeCurrency(asNumber(data.averageOrderValue))}`,
          `Additional annual revenue: ${formatWholeCurrency(asNumber(result.annualRevenueLift))}`,
          `Monthly revenue lift: ${formatWholeCurrency(asNumber(result.monthlyRevenueLift))}`,
          `Projected conversion rate: ${formatPercentage(asNumber(result.newConversionRate))}`,
          `ROI: ${formatWholeNumber(asNumber(result.roiPercent))}%`
        ]
      : toolSlug === "response-time-calculator"
        ? [
            `Industry: ${asString(data.industryLabel)}`,
            `Your response time: ${asNumber(result.responseTimeMinutes)} min`,
            `Team size: ${asNumber(result.teamSize)}`,
            `Grade: ${asString(result.grade)} (${asString(result.summary)})`,
            `Industry average: ${asNumber(result.averageBenchmark)} min`,
            `Top performers: ${asNumber(result.topPerformerBenchmark)} min`,
            ...asStrings(result.tips).map((tip) => `Tip: ${tip}`)
          ]
        : toolSlug === "welcome-message-generator"
          ? [
              `Scenario: ${asString(data.scenarioLabel)}`,
              `Tone: ${asString(data.toneLabel)}`,
              ...((Array.isArray(data.variants) ? data.variants : []) as Array<Record<string, unknown>>).flatMap((variant) => [
                `${asString(variant.label)}:`,
                asString(variant.message)
              ])
            ]
        : toolSlug === "response-tone-checker"
          ? [
              `Context: ${asString(data.contextLabel)}`,
              `Original message: ${asString(data.message)}`,
              `Overall score: ${asNumber(analysis.overall_score)}/10`,
              `Overall label: ${asString(analysis.overall_label)}`,
              ...(Object.entries(asRecord(analysis.dimensions)) as Array<[string, unknown]>).map(
                ([key, item]) => `${key}: ${asNumber(asRecord(item).score)}/10`
              ),
              ...((Array.isArray(analysis.issues) ? analysis.issues : []) as Array<Record<string, unknown>>).map(
                (item) => `Issue: "${asString(item.text)}" -> ${asString(item.suggestion)}`
              ),
              ...asStrings(analysis.strengths).map((item) => `Strength: ${item}`),
              `Rewrite: ${asString(analysis.rewritten)}`
            ]
          : (() => {
              throw new Error("UNSUPPORTED_TOOL_EXPORT");
            })();

  const toolUrl = buildAbsoluteUrl(tool.href);
  const attachment: EmailAttachment = {
    fileName: `${tool.slug}-report.txt`,
    contentType: "text/plain; charset=utf-8",
    content: Buffer.from(`${tool.title}\n\n${lines.join("\n")}\n\nOpen the tool again:\n${toolUrl}`, "utf8")
  };

  return {
    subject: `Your ${tool.title} report`,
    bodyText: `Here is your ${tool.title.toLowerCase()} report.\n\n${lines.join("\n")}\n\nDownload the attached report or reopen the tool:\n${toolUrl}`,
    bodyHtml: renderChattingEmailPage({
      preheader: `Your ${tool.title} report is ready.`,
      title: `Your ${tool.title} report is ready.`,
      description: "A text export is attached to this email.",
      sections: [
        {
          kind: "panel",
          html: lines
            .map(
              (line) =>
                `<div style="margin-top:10px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;word-break:normal;word-wrap:normal;overflow-wrap:normal;hyphens:none;">${escapeHtml(
                  line
                )}</div>`
            )
            .join(""),
          padding: "0 32px 24px"
        },
        {
          kind: "html",
          html: `<div style="text-align:center;font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">A text export is attached to this email.</div>`,
          align: "center",
          padding: "0 32px 32px"
        }
      ],
      actions: { primary: { href: toolUrl, label: "Open the tool again" }, padding: "0 32px 24px", borderTopColor: undefined }
    }),
    attachment
  };
}

export async function sendFreeToolExportEmail(input: {
  email: string;
  toolSlug: string;
  resultPayload: unknown;
}) {
  const report = buildReport(input.toolSlug, input.resultPayload);

  await sendRenderedEmail({
    from: resolvePrimaryBrandHelloMailFrom(),
    to: input.email,
    rendered: report,
    attachments: [report.attachment]
  });
}
