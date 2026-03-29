import { randomUUID } from "node:crypto";
import { sendNewsletterWelcomeEmail } from "@/lib/newsletter-email";
import {
  findNewsletterSubscriberByEmail,
  insertNewsletterSubscriberRecord,
  markNewsletterWelcomeEmailSent,
  updateNewsletterSubscriberSource
} from "@/lib/repositories/newsletter-repository";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeNewsletterEmail(value: string) {
  return value.trim().toLowerCase();
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

  if (existing?.welcome_email_sent_at) {
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

  if (existing) {
    await updateNewsletterSubscriberSource(existing.id, source);
  }

  try {
    await sendNewsletterWelcomeEmail(email);
  } catch {
    throw new Error("NEWSLETTER_DELIVERY_FAILED");
  }

  await markNewsletterWelcomeEmailSent(subscriber.id);

  return { alreadySubscribed: false };
}
