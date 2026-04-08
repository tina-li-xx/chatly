import { getPublicAppUrl } from "@/lib/env";
import {
  sendTrialEndingReminderEmail,
  sendTrialExpiredEmail
} from "@/lib/chatting-marketing-email-senders";
import { maybeSendGrowthEmail, getGrowthDeliverySettings } from "@/lib/growth-outreach-shared";
import {
  countActiveTeamMembershipRows
} from "@/lib/repositories/workspace-repository";
import {
  findBillingAccountRow,
  findBillingUsageRow
} from "@/lib/repositories/billing-repository";
import { findAuthUserById } from "@/lib/repositories/auth-repository";
import { displayNameFromEmail, firstNameFromDisplayName } from "@/lib/user-display";

const TRIAL_ENDING_WINDOW_HOURS = 24 * 3;
const TRIAL_EMAIL_COOLDOWN_HOURS = 24 * 365;

function formatTrialDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function buildTrialLifecycleUrl() {
  return `${getPublicAppUrl().replace(/\/$/, "")}/dashboard/settings?section=billing`;
}

function trialHoursRemaining(trialEndsAt: string, now: Date) {
  return (new Date(trialEndsAt).getTime() - now.getTime()) / (60 * 60 * 1000);
}

async function buildTrialEndingMetrics(userId: string) {
  const [usage, memberCount] = await Promise.all([
    findBillingUsageRow(userId),
    countActiveTeamMembershipRows(userId)
  ]);

  return [
    { value: String(Number(usage.conversation_count ?? 0)), label: "conversations" },
    { value: String(Number(usage.site_count ?? 0)), label: "sites" },
    { value: String(memberCount + 1), label: "teammates" }
  ];
}

function trialEndingKey(trialEndsAt: string) {
  return `trial-ending-${trialEndsAt.slice(0, 10)}`;
}

function trialExpiredKey(trialEndedAt: string) {
  return `trial-expired-${trialEndedAt.slice(0, 10)}`;
}

export async function maybeSendTrialEndingReminder(userId: string, now = new Date()) {
  const [user, delivery, account] = await Promise.all([
    findAuthUserById(userId),
    getGrowthDeliverySettings(userId),
    findBillingAccountRow(userId)
  ]);
  const trialEndsAt = account?.trial_ends_at;
  if (!user || !delivery?.emailNotifications || !trialEndsAt) {
    return;
  }

  if (account.plan_key !== "growth") {
    return;
  }

  const hoursRemaining = trialHoursRemaining(trialEndsAt, now);
  if (hoursRemaining <= 0 || hoursRemaining > TRIAL_ENDING_WINDOW_HOURS) {
    return;
  }

  const metrics = await buildTrialEndingMetrics(userId);
  const firstName = firstNameFromDisplayName(displayNameFromEmail(user.email));
  const billingUrl = buildTrialLifecycleUrl();

  await maybeSendGrowthEmail(
    userId,
    trialEndingKey(trialEndsAt),
    TRIAL_EMAIL_COOLDOWN_HOURS,
    () =>
      sendTrialEndingReminderEmail({
        to: delivery.notificationEmail,
        firstName,
        endDate: formatTrialDate(trialEndsAt),
        metrics,
        upgradeUrl: billingUrl
      })
  );
}

export async function maybeSendTrialExpiredEmail(input: {
  userId: string;
  trialEndedAt: string;
}) {
  const [user, delivery] = await Promise.all([
    findAuthUserById(input.userId),
    getGrowthDeliverySettings(input.userId)
  ]);
  if (!user || !delivery?.emailNotifications) {
    return;
  }

  const billingUrl = buildTrialLifecycleUrl();
  const firstName = firstNameFromDisplayName(displayNameFromEmail(user.email));

  await maybeSendGrowthEmail(
    input.userId,
    trialExpiredKey(input.trialEndedAt),
    TRIAL_EMAIL_COOLDOWN_HOURS,
    () =>
      sendTrialExpiredEmail({
        to: delivery.notificationEmail,
        firstName,
        reactivateUrl: billingUrl
      })
  );
}
