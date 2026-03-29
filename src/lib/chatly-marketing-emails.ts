import {
  joinEmailText,
  renderBrandLockup,
  renderButtonRow,
  renderChatlyEmailShell,
  renderDivider,
  renderEmailSection,
  renderHeadingBlock,
  renderMetricGrid,
  renderPanel
} from "@/lib/chatly-email-foundation";
import { formatBillingPriceLabel, getBillingPlanDefinition } from "@/lib/billing-plans";
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
    bodyHtml: renderChatlyEmailShell({
      preheader: `Your Chatting trial wraps up on ${input.endDate}.`,
      rows: [
        renderEmailSection(renderBrandLockup()),
        renderDivider(),
        renderEmailSection(
          `${renderHeadingBlock({ title: "Your trial ends in 3 days" })}<div style="margin-top:16px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">Hey ${escapeHtml(
            input.firstName
          )}, your Chatting trial wraps up on ${escapeHtml(input.endDate)}. Here's what you've accomplished so far:</div>`
        ),
        renderEmailSection(renderMetricGrid(input.metrics), { padding: "0 26px 24px" }),
        renderEmailSection(
          `<div style="text-align:center;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">Keep the momentum going. Upgrade now and never miss another visitor question.</div>`,
          { padding: "0 32px 20px" }
        ),
        renderEmailSection(
          renderButtonRow({
            primary: { href: input.upgradeUrl, label: "Upgrade Now" },
            secondary: input.plansUrl ? { href: input.plansUrl, label: "View Plans" } : null
          }),
          { align: "center", padding: "0 32px 32px" }
        )
      ]
    })
  };
}

export function renderTrialExpiredEmail(input: {
  firstName: string;
  reactivateUrl: string;
}): RenderedEmail {
  const growthPlan = getBillingPlanDefinition("growth");
  const growthPrice = `${growthPlan.name} - ${formatBillingPriceLabel("growth", "monthly")}`;
  const growthHighlights = growthPlan.marketingFeatures.slice(0, 3);

  return {
    subject: "Your Chatting trial has ended",
    bodyText: joinEmailText([
      `Your trial has ended\n\nHey ${input.firstName},`,
      "Your Chatting trial ended today. Your widget is now paused, but all your conversations and settings are safe.",
      `Ready to keep chatting?\n${growthPrice}\n${growthHighlights.map((item) => `• ${item}`).join("\n")}`,
      `Reactivate Account: ${input.reactivateUrl}`,
      "Not ready? Your data stays safe for 30 days."
    ]),
    bodyHtml: renderChatlyEmailShell({
      preheader: "Your widget is paused, but your conversations are still safe.",
      rows: [
        renderEmailSection(renderBrandLockup()),
        renderDivider(),
        renderEmailSection(
          `${renderHeadingBlock({ title: "Your trial has ended" })}<div style="margin-top:16px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">Hey ${escapeHtml(
            input.firstName
          )}, your Chatting trial ended today. Your widget is now paused, but all your conversations and settings are safe.</div>`
        ),
        renderEmailSection(
          renderPanel(
            `<div style="font:600 15px/1.6 Georgia,'Times New Roman',serif;color:#0F172A;">${escapeHtml(
              growthPrice
            )}</div><div style="margin-top:10px;font:400 14px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${growthHighlights
              .map((item) => `&#8226; ${escapeHtml(item)}`)
              .join("<br />")}</div>`
          ),
          { padding: "0 32px 24px" }
        ),
        renderEmailSection(renderButtonRow({ primary: { href: input.reactivateUrl, label: "Reactivate Account" } }), {
          align: "center",
          padding: "0 32px 24px"
        }),
        renderEmailSection(
          `<div style="text-align:center;font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#64748B;">Not ready? Your data stays safe for 30 days.</div>`,
          { padding: "0 32px 32px" }
        )
      ]
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
    bodyHtml: renderChatlyEmailShell({
      preheader: `${input.featureName} is now available in Chatting.`,
      rows: [
        renderEmailSection(renderBrandLockup()),
        renderDivider(),
        renderEmailSection(renderHeadingBlock({ title: "What's new in Chatting", meta: input.monthLabel })),
        renderEmailSection(
          renderPanel(
            `<div style="font:600 18px/1.4 Georgia,'Times New Roman',serif;color:#0F172A;">&#128640; ${escapeHtml(
              input.featureName
            )}</div><div style="margin-top:12px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
              input.featureDescription
            )}</div>`
          ),
          { padding: "0 32px 24px" }
        ),
        renderEmailSection(renderButtonRow({ primary: { href: input.tryItUrl, label: "Try It Now \u2192" } }), {
          align: "center",
          padding: "0 32px 24px"
        }),
        renderEmailSection(
          renderPanel(
            `<div style="font:600 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Also in this update</div><div style="margin-top:10px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${input.additionalUpdates
              .map((item) => `<div style="margin-top:8px;">&#8226; ${escapeHtml(item)}</div>`)
              .join("")}</div>`
          ),
          { padding: "0 32px 24px" }
        ),
        renderEmailSection(renderButtonRow({ primary: { href: input.changelogUrl, label: "Read Full Changelog" } }), {
          align: "center",
          padding: "0 32px 32px"
        })
      ]
    })
  };
}

export function renderTrialExtensionOutreachEmail(input: {
  planName: string;
  formattedEndDate: string;
}): RenderedEmail {
  return {
    subject: `Your ${input.planName} trial now runs until ${input.formattedEndDate}`,
    bodyText: joinEmailText([
      "We extended your Chatting trial by 7 days because your workspace is active and we don't want you to lose momentum.",
      `Your updated trial end date: ${input.formattedEndDate}`,
      "If you'd like help with rollout, pricing, or setup, reply directly to this email and we'll jump in personally."
    ]),
    bodyHtml: renderChatlyEmailShell({
      preheader: `Your ${input.planName} trial has been extended.`,
      rows: [
        renderEmailSection(renderBrandLockup()),
        renderDivider(),
        renderEmailSection(
          `${renderHeadingBlock({ title: "Your trial has more runway" })}<div style="margin-top:16px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">We extended your Chatting trial by <strong style="color:#0F172A;">7 days</strong> because your workspace is active and we don't want you to lose momentum.</div>`
        ),
        renderEmailSection(
          renderPanel(
            `<div style="font:600 16px/1.5 Georgia,'Times New Roman',serif;color:#0F172A;">Your updated trial end date</div><div style="margin-top:8px;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">${escapeHtml(
              input.formattedEndDate
            )}</div>`
          ),
          { padding: "0 32px 24px" }
        ),
        renderEmailSection(
          `<div style="font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#475569;">If you'd like help with rollout, pricing, or setup, reply directly to this email and we'll jump in personally.</div>`,
          { padding: "0 32px 32px" }
        )
      ]
    })
  };
}
