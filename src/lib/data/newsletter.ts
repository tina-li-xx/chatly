import { randomUUID } from "node:crypto";
import { sendNewsletterWelcomeEmail } from "@/lib/newsletter-email";
import { buildNewsletterPreferencesToken, parseNewsletterPreferencesToken } from "@/lib/newsletter-preferences-token";
import { getPublicAppUrl } from "@/lib/env";
import {
  findNewsletterSubscriberById,
  findNewsletterSubscriberByEmail,
  insertNewsletterSubscriberRecord,
  markNewsletterWelcomeEmailSent,
  updateNewsletterSubscriberSubscription,
  updateNewsletterSubscriberSource
} from "@/lib/repositories/newsletter-repository";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeNewsletterEmail(value: string) {
  return value.trim().toLowerCase();
}

function buildNewsletterPreferencesUrl(subscriberId: string) {
  const url = new URL("/newsletter/preferences", getPublicAppUrl());
  url.searchParams.set("token", buildNewsletterPreferencesToken(subscriberId));
  return url.toString();
}

function toNewsletterPreferences(subscriber: {
  email: string;
  unsubscribed_at: string | null;
}) {
  return {
    email: subscriber.email,
    subscribed: !subscriber.unsubscribed_at
  };
}

async function findNewsletterSubscriberFromToken(token: string) {
  const parsed = parseNewsletterPreferencesToken(token);
  if (!parsed) {
    return null;
  }

  return findNewsletterSubscriberById(parsed.subscriberId);
}

export async function subscribeToNewsletter(input: { email: string; source: string }) {
  const email = normalizeNewsletterEmail(input.email);
  const source = input.source.trim() || "blog";

  if (!email) {
    throw new Error("MISSING_EMAIL");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error("INVALID_EMAIL");
  }

  const existing = await findNewsletterSubscriberByEmail(email);

  if (existing?.welcome_email_sent_at && !existing.unsubscribed_at) {
    await updateNewsletterSubscriberSource(existing.id, source);
    return { alreadySubscribed: true };
  }

  const subscriber =
    existing ??
    (await insertNewsletterSubscriberRecord({
      id: randomUUID(),
      email,
      source
    }));

  if (subscriber.last_source !== source) {
    await updateNewsletterSubscriberSource(subscriber.id, source);
  }

  if (existing?.unsubscribed_at) {
    await updateNewsletterSubscriberSubscription(subscriber.id, true);
  }

  try {
    await sendNewsletterWelcomeEmail({
      email,
      preferencesUrl: buildNewsletterPreferencesUrl(subscriber.id)
    });
  } catch {
    throw new Error("NEWSLETTER_DELIVERY_FAILED");
  }

  await markNewsletterWelcomeEmailSent(subscriber.id);

  return { alreadySubscribed: false };
}

export async function getNewsletterPreferencesByToken(token: string) {
  const subscriber = await findNewsletterSubscriberFromToken(token);
  return subscriber ? toNewsletterPreferences(subscriber) : null;
}

export async function updateNewsletterPreferencesByToken(input: {
  token: string;
  subscribed: boolean;
}) {
  const subscriber = await findNewsletterSubscriberFromToken(input.token);
  if (!subscriber) {
    throw new Error("INVALID_NEWSLETTER_PREFERENCES_TOKEN");
  }

  const updated = await updateNewsletterSubscriberSubscription(subscriber.id, input.subscribed);
  if (!updated) {
    throw new Error("INVALID_NEWSLETTER_PREFERENCES_TOKEN");
  }

  return toNewsletterPreferences(updated);
}
