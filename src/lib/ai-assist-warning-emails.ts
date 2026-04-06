import {
  resolveAiAssistWarningState,
  warningEmailKeyForState
} from "@/lib/ai-assist-warning";
import { sendAiAssistWarningEmail } from "@/lib/chatly-notification-email-senders";
import { getPublicAppUrl } from "@/lib/env";
import {
  claimAiAssistWarningDelivery,
  listAiAssistWarningRecipientRows,
  releaseAiAssistWarningDelivery
} from "@/lib/repositories/ai-assist-warning-repository";
import { optionalText } from "@/lib/utils";

export async function maybeSendAiAssistWarningEmails(input: {
  ownerUserId: string;
  used: number;
  limit: number | null;
  cycleStart: string;
  resetsAt: string;
}) {
  const state = resolveAiAssistWarningState(input.used, input.limit);
  const warningKey = warningEmailKeyForState(state);
  if (!warningKey || input.limit == null) {
    return;
  }

  const recipients = await listAiAssistWarningRecipientRows(input.ownerUserId);
  const billingUrl = `${getPublicAppUrl()}/dashboard/settings?section=billing`;

  for (const recipient of recipients) {
    const claimed = await claimAiAssistWarningDelivery({
      userId: recipient.user_id,
      ownerUserId: recipient.owner_user_id,
      cycleStart: input.cycleStart,
      warningKey
    });
    if (!claimed) {
      continue;
    }

    try {
      await sendAiAssistWarningEmail({
        to: optionalText(recipient.notification_email) || recipient.email,
        teamName: recipient.team_name || "Chatting",
        used: input.used,
        limit: input.limit,
        resetsAt: input.resetsAt,
        billingUrl,
        state
      });
    } catch (error) {
      await releaseAiAssistWarningDelivery({
        userId: recipient.user_id,
        ownerUserId: recipient.owner_user_id,
        cycleStart: input.cycleStart,
        warningKey
      });
      console.error(
        "ai assist warning email failed",
        recipient.user_id,
        recipient.owner_user_id,
        error
      );
    }
  }
}
