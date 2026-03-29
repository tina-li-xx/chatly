import { query } from "@/lib/db";

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  source: string;
  last_source: string;
  welcome_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function findNewsletterSubscriberByEmail(email: string) {
  const result = await query<NewsletterSubscriberRow>(
    `
      SELECT
        id,
        email,
        source,
        last_source,
        welcome_email_sent_at,
        created_at,
        updated_at
      FROM newsletter_subscribers
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function insertNewsletterSubscriberRecord(input: {
  id: string;
  email: string;
  source: string;
}) {
  const result = await query<NewsletterSubscriberRow>(
    `
      INSERT INTO newsletter_subscribers (id, email, source, last_source)
      VALUES ($1, $2, $3, $3)
      RETURNING
        id,
        email,
        source,
        last_source,
        welcome_email_sent_at,
        created_at,
        updated_at
    `,
    [input.id, input.email, input.source]
  );

  return result.rows[0];
}

export async function updateNewsletterSubscriberSource(id: string, source: string) {
  const result = await query<NewsletterSubscriberRow>(
    `
      UPDATE newsletter_subscribers
      SET last_source = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        email,
        source,
        last_source,
        welcome_email_sent_at,
        created_at,
        updated_at
    `,
    [id, source]
  );

  return result.rows[0] ?? null;
}

export async function markNewsletterWelcomeEmailSent(id: string) {
  await query(
    `
      UPDATE newsletter_subscribers
      SET welcome_email_sent_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}
