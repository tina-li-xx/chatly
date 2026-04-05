import { getPublicAppUrl } from "@/lib/env";
import { buildEmailUnsubscribeToken, parseEmailUnsubscribeToken } from "@/lib/email-unsubscribe-token";
import {
  findEmailRecipientPreferenceByEmail,
  upsertEmailRecipientSubscription
} from "@/lib/repositories/email-recipient-repository";
import { findNewsletterSubscriberByEmail, updateNewsletterSubscriberSubscriptionByEmail } from "@/lib/repositories/newsletter-repository";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function buildEmailUnsubscribeUrl(email: string) {
  const url = new URL("/email/unsubscribe", getPublicAppUrl());
  url.searchParams.set("token", buildEmailUnsubscribeToken(normalizeEmail(email)));
  return url.toString();
}

export async function getEmailUnsubscribePreferencesByToken(token: string) {
  const parsed = parseEmailUnsubscribeToken(token);
  if (!parsed) {
    return null;
  }

  const email = normalizeEmail(parsed.email);
  const preference = await findEmailRecipientPreferenceByEmail(email);

  return {
    email,
    subscribed: !preference?.unsubscribed_at
  };
}

export async function updateEmailUnsubscribePreferencesByToken(input: {
  token: string;
  subscribed: boolean;
}) {
  const parsed = parseEmailUnsubscribeToken(input.token);
  if (!parsed) {
    throw new Error("INVALID_EMAIL_UNSUBSCRIBE_TOKEN");
  }

  const email = normalizeEmail(parsed.email);
  const updated = await upsertEmailRecipientSubscription(email, input.subscribed);
  const newsletter = await findNewsletterSubscriberByEmail(email);

  if (newsletter) {
    await updateNewsletterSubscriberSubscriptionByEmail(email, input.subscribed);
  }

  return {
    email: updated.email,
    subscribed: !updated.unsubscribed_at
  };
}

export async function isEmailRecipientUnsubscribed(email: string) {
  const preference = await findEmailRecipientPreferenceByEmail(normalizeEmail(email));
  return Boolean(preference?.unsubscribed_at);
}
