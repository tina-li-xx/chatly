import {
  joinEmailText,
  renderBulletList,
  renderChattingEmailPage,
  renderLabelText,
  renderParagraph,
  renderSmallText,
  renderStack,
  renderTextBlock,
  renderTitleText
} from "@/lib/chatting-email-foundation";
import { getBillingPlanDefinition } from "@/lib/billing-plans";
import { getChattingGrowthPriceBreakdown } from "@/lib/pricing";
import { escapeHtml } from "@/lib/utils";

type RenderedEmail = { subject: string; bodyText: string; bodyHtml: string };

export function renderTrialEndingReminderEmail(input: {
  firstName: string;
  endDate: string;
  metrics: Array<{ value: string; label: string }>;
  upgradeUrl: string;
  plansUrl?: string;
}): RenderedEmail {
  return {
    subject: "Your trial ends in 3 days",
    bodyText: joinEmailText([
      `Your trial ends in 3 days\n\nHey ${input.firstName},`,
      `Your Chatting trial wraps up on ${input.endDate}. Here's what you've accomplished so far:\n${input.metrics
        .map((metric) => `${metric.value} ${metric.label}`)
        .join("\n")}`,
      `Upgrade Now: ${input.upgradeUrl}`,
      input.plansUrl ? `View Plans: ${input.plansUrl}` : undefined,
      "Questions about pricing? Reply to this email."
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: `Your Chatting trial wraps up on ${input.endDate}.`,
      title: "Your trial ends in 3 days",
      description: `Hey ${input.firstName}, your Chatting trial wraps up on ${input.endDate}. Here's what you've accomplished so far:`,
      sections: [
        { kind: "metrics", metrics: input.metrics, padding: "0 26px 24px" },
        {
          kind: "html",
          html: renderParagraph("Keep the momentum going. Upgrade now and never miss another visitor question.", "center"),
          padding: "0 32px 20px"
        }
      ],
      actions: {
        primary: { href: input.upgradeUrl, label: "Upgrade Now" },
        secondary: input.plansUrl ? { href: input.plansUrl, label: "View Plans" } : null,
        padding: "0 32px 32px",
        borderTopColor: undefined
      }
    })
  };
}

export function renderTrialExpiredEmail(input: {
  firstName: string;
  reactivateUrl: string;
}): RenderedEmail {
  const growthPlan = getBillingPlanDefinition("growth");
  const [growthBaseTier, ...growthSeatTiers] = getChattingGrowthPriceBreakdown("monthly");
  const growthHighlights = growthPlan.marketingFeatures.slice(0, 3);
  const growthPricingLines = [
    `Starts at ${growthBaseTier.priceLabel} for ${growthBaseTier.rangeLabel.toLowerCase()}`,
    ...growthSeatTiers.map((tier) => `${tier.priceLabel} for ${tier.rangeLabel}`)
  ];
  const growthPricingHtml = renderStack(
    [
      renderTextBlock({
        html: `Starts at <strong style="font-weight:600;color:#0F172A;">${escapeHtml(
          growthBaseTier.priceLabel
        )}</strong> for ${escapeHtml(growthBaseTier.rangeLabel.toLowerCase())}.`
      }),
      ...growthSeatTiers.map((tier) =>
        renderTextBlock({
          html: `<strong style="font-weight:600;color:#0F172A;">${escapeHtml(
            tier.priceLabel
          )}</strong> <span style="color:#64748B;">for ${escapeHtml(tier.rangeLabel)}</span>`,
          fontSize: 14,
          lineHeight: "1.6"
        })
      )
    ],
    { gap: "6px" }
  );

  return {
    subject: "Your Chatting trial has ended",
    bodyText: joinEmailText([
      `Your trial has ended\n\nHey ${input.firstName},`,
      "Your Chatting trial ended today. Your workspace has moved to Starter, and all your conversations and settings are safe.",
      `Ready to keep chatting?\nGrowth pricing\n${growthPricingLines.join("\n")}\n${growthHighlights
        .map((item) => `• ${item}`)
        .join("\n")}`,
      `Reactivate Account: ${input.reactivateUrl}`,
      "Not ready? Your data stays safe for 30 days."
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: "Your workspace is now on Starter, and your conversations are still safe.",
      title: "Your trial has ended",
      description: `Hey ${input.firstName}, your Chatting trial ended today. Your workspace has moved to Starter, and all your conversations and settings are safe.`,
      sections: [
        {
          kind: "panel",
          html: renderStack(
            [
              renderLabelText("Growth pricing"),
              growthPricingHtml,
              renderBulletList(growthHighlights)
            ],
            { gap: "10px" }
          ),
          padding: "0 32px 24px"
        },
        {
          kind: "html",
          html: renderSmallText("Not ready? Your data stays safe for 30 days.", "center"),
          padding: "0 32px 32px"
        }
      ],
      actions: { primary: { href: input.reactivateUrl, label: "Reactivate Account" }, padding: "0 32px 24px", borderTopColor: undefined }
    })
  };
}

export function renderProductUpdateEmail(input: {
  featureName: string;
  featureDescription: string;
  monthLabel: string;
  tryItUrl: string;
  changelogUrl: string;
  additionalUpdates: string[];
}): RenderedEmail {
  return {
    subject: `New in Chatting: ${input.featureName}`,
    bodyText: joinEmailText([
      `What's new in Chatting\n${input.monthLabel}`,
      `${input.featureName}\n${input.featureDescription}`,
      `Try It Now → ${input.tryItUrl}`,
      "Also in this update:\n" + input.additionalUpdates.map((item) => `• ${item}`).join("\n"),
      `Read Full Changelog: ${input.changelogUrl}`
    ]),
    bodyHtml: renderChattingEmailPage({
      preheader: `${input.featureName} is now available in Chatting.`,
      title: "What's new in Chatting",
      meta: input.monthLabel,
      sections: [
        {
          kind: "panel",
          html: renderStack(
            [renderTitleText(`&#128640; ${escapeHtml(input.featureName)}`), renderParagraph(escapeHtml(input.featureDescription))],
            { gap: "12px" }
          ),
          padding: "0 32px 24px"
        },
        {
          kind: "panel",
          html: renderStack([renderLabelText("Also in this update"), renderBulletList(input.additionalUpdates)], { gap: "10px" }),
          padding: "0 32px 24px"
        }
      ],
      actions: { primary: { href: input.tryItUrl, label: "Try It Now \u2192" }, secondary: { href: input.changelogUrl, label: "Read Full Changelog" }, padding: "0 32px 32px", borderTopColor: undefined }
    })
  };
}
