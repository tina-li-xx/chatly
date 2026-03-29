import { getDashboardNotificationDeliverySettings } from "@/lib/data";
import { sendStarterUpgradePromptEmail } from "@/lib/billing-upgrade-email";
import { normalizeBillingPlanKey } from "@/lib/billing-plans";
import { sendTeamNewMessageEmail } from "@/lib/email";
import { getPublicAppUrl } from "@/lib/env";
import { getStarterConversationUsage, shouldSendStarterUpgradeEmail } from "@/lib/freemium";
import { maybeSendAnalyticsExpansionEmail } from "@/lib/growth-outreach";
import { publishDashboardLive } from "@/lib/live-events";
import { findBillingAccountRow, findBillingUsageRow } from "@/lib/repositories/billing-repository";

type IncomingVisitorMessageNotificationInput = {
  userId: string;
  conversationId: string;
  createdAt: string;
  preview: string;
  siteName: string;
  visitorLabel: string | null;
  pageUrl: string | null;
  location: string | null;
  attachmentsCount: number;
  isNewConversation: boolean;
  isNewVisitor: boolean;
  highIntent: boolean;
};

export async function notifyIncomingVisitorMessage(
  input: IncomingVisitorMessageNotificationInput
) {
  publishDashboardLive(input.userId, {
    type: "message.created",
    conversationId: input.conversationId,
    sender: "user",
    createdAt: input.createdAt,
    preview: input.preview,
    pageUrl: input.pageUrl,
    location: input.location,
    siteName: input.siteName,
    visitorLabel: input.visitorLabel,
    isNewConversation: input.isNewConversation,
    isNewVisitor: input.isNewVisitor,
    highIntent: input.highIntent
  });
  publishDashboardLive(input.userId, {
    type: "conversation.updated",
    conversationId: input.conversationId,
    status: "open",
    updatedAt: input.createdAt
  });

  try {
    const deliverySettings = await getDashboardNotificationDeliverySettings(input.userId);
    const [billingAccount, billingUsage] = await Promise.all([
      findBillingAccountRow(input.userId),
      findBillingUsageRow(input.userId)
    ]);
    const planKey = normalizeBillingPlanKey(billingAccount?.plan_key);
    const starterConversationUsage =
      planKey === "starter"
        ? getStarterConversationUsage(Number(billingUsage.conversation_count ?? 0))
        : null;

    if (deliverySettings.emailNotifications) {
      await sendTeamNewMessageEmail({
        to: deliverySettings.notificationEmail,
        siteName: input.siteName,
        conversationId: input.conversationId,
        content: input.preview,
        visitorEmail: input.visitorLabel,
        pageUrl: input.pageUrl,
        attachmentsCount: input.attachmentsCount
      });
    }

    if (
      input.isNewConversation &&
      starterConversationUsage &&
      shouldSendStarterUpgradeEmail(starterConversationUsage.conversationCount)
    ) {
      await sendStarterUpgradePromptEmail({
        to: deliverySettings.notificationEmail,
        prompt: {
          conversationCount: starterConversationUsage.conversationCount,
          conversationLimit: starterConversationUsage.conversationLimit,
          remainingConversations: starterConversationUsage.remainingConversations,
          billingUrl: `${getPublicAppUrl()}/dashboard/settings?section=billing`,
          limitReached: starterConversationUsage.limitReached
        }
      });
    }

    if (input.isNewConversation) {
      await maybeSendAnalyticsExpansionEmail(input.userId);
    }
  } catch (notificationError) {
    console.error("team new message email failed", notificationError);
  }
}
