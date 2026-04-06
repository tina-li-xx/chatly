import {
  joinEmailText,
  renderChattingEmailPage,
  renderSmallText,
  renderStack,
  renderTextBlock
} from "@/lib/chatly-email-foundation";
import { escapeHtml } from "@/lib/utils";

type RenderedEmail = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
};

function resetLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long"
  }).format(new Date(value));
}

export function renderAiAssistWarningEmail(input: {
  used: number;
  limit: number;
  resetsAt: string;
  billingUrl: string;
  state: "warning" | "limited";
}): RenderedEmail {
  const reset = resetLabel(input.resetsAt);
  const title =
    input.state === "limited"
      ? "AI Assist limit reached"
      : "Your team is approaching the AI Assist limit";
  const detail =
    input.state === "limited"
      ? `Your team has used ${input.used} of ${input.limit} AI Assist requests in the current billing cycle. AI features are paused until ${reset}.`
      : `Your team has used ${input.used} of ${input.limit} AI Assist requests in the current billing cycle. When you reach the limit, AI features will pause until ${reset}.`;

  return {
    subject: title,
    bodyText: joinEmailText([title, detail, `Open billing: ${input.billingUrl}`]),
    bodyHtml: renderChattingEmailPage({
      preheader: detail,
      title,
      sections: [
        {
          kind: "panel",
          html: renderStack(
            [
              renderTextBlock({
                html: escapeHtml(detail),
                color: "#0F172A"
              }),
              renderSmallText(`Current usage: ${input.used} / ${input.limit}`)
            ],
            { gap: "10px" }
          ),
          padding: "0 32px 32px"
        }
      ],
      actions: {
        primary: {
          href: input.billingUrl,
          label: input.state === "limited" ? "Open billing" : "Review billing"
        },
        padding: "0 32px 32px",
        borderTopColor: undefined
      }
    })
  };
}
