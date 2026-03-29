import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { buildMimeMessage, type EmailAttachment } from "@/lib/email-mime";
import { getSesClientConfig } from "@/lib/env.server";

type SendSesEmailInput = {
  to: string;
  from: string;
  replyTo?: string | null;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  attachments?: EmailAttachment[];
};

let sesClient: SESClient | null = null;

function getSesClient() {
  if (sesClient) {
    return sesClient;
  }
  const config = getSesClientConfig();

  sesClient = new SESClient({
    region: config.region,
    credentials: config.credentials
  });

  return sesClient;
}

function extractEmailAddress(value: string) {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] || value;
}

function getReplyToAddress(replyTo?: string | null) {
  return replyTo?.trim() || undefined;
}

async function sendRawSesEmail({
  to,
  from,
  replyTo,
  subject,
  bodyText,
  bodyHtml,
  attachments = []
}: SendSesEmailInput) {
  const source = extractEmailAddress(from);
  const rawMessage = buildMimeMessage({
    to,
    from,
    replyTo: getReplyToAddress(replyTo),
    subject,
    bodyText,
    bodyHtml,
    attachments
  });

  const response = await getSesClient().send(
    new SendRawEmailCommand({
      Source: source,
      Destinations: [to],
      RawMessage: {
        Data: Buffer.from(rawMessage)
      }
    })
  );

  return response.MessageId || null;
}

export async function sendSesEmail(input: SendSesEmailInput) {
  return sendRawSesEmail(input);
}
