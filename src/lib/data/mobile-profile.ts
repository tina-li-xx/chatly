import { changeUserPassword } from "@/lib/auth";
import { splitSettingsName } from "@/lib/data/settings-helpers";
import {
  findDashboardSettingsRow,
  upsertUserSettingsRecord
} from "@/lib/repositories/settings-repository";
import { optionalText } from "@/lib/utils";

export type MobileProfile = {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  avatarDataUrl: string | null;
};

export async function getMobileProfile(userId: string): Promise<MobileProfile> {
  const row = await findDashboardSettingsRow(userId);
  if (!row) {
    throw new Error("USER_NOT_FOUND");
  }

  const name = splitSettingsName(row.email, row.first_name, row.last_name);

  return {
    firstName: name.firstName,
    lastName: name.lastName,
    email: row.email,
    jobTitle: row.job_title ?? "",
    avatarDataUrl: optionalText(row.avatar_data_url)
  };
}

export async function updateMobileProfile(
  userId: string,
  input: Pick<MobileProfile, "firstName" | "lastName" | "jobTitle" | "avatarDataUrl">
) {
  const row = await findDashboardSettingsRow(userId);
  if (!row) {
    throw new Error("USER_NOT_FOUND");
  }

  await upsertUserSettingsRecord({
    userId,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    jobTitle: input.jobTitle.trim(),
    avatarDataUrl: optionalText(input.avatarDataUrl),
    notificationEmail: optionalText(row.notification_email),
    replyToEmail: optionalText(row.reply_to_email),
    emailTemplatesJson: row.email_templates_json ?? "",
    browserNotifications: row.browser_notifications ?? true,
    soundAlerts: row.sound_alerts ?? true,
    emailNotifications: row.email_notifications ?? true,
    newVisitorAlerts: row.new_visitor_alerts ?? false,
    highIntentAlerts: row.high_intent_alerts ?? true,
    emailSignature: row.email_signature ?? ""
  });

  return getMobileProfile(userId);
}

export async function updateMobilePassword(
  userId: string,
  input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
) {
  if (input.newPassword.trim() !== input.confirmPassword.trim()) {
    throw new Error("PASSWORD_CONFIRM");
  }

  await changeUserPassword(userId, input.currentPassword, input.newPassword);
  return { updated: true };
}
