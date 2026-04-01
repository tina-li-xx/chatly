import { sendRichEmail } from "@/lib/email";
import type { EmailAttachment } from "@/lib/email-mime";

type RenderedEmail = {
  subject: string;
  bodyText: string;
  bodyHtml: string;
};

type SendRenderedEmailInput = {
  to: string;
  from?: string;
  replyTo?: string | null;
  attachments?: EmailAttachment[];
  rendered: RenderedEmail;
};

export async function sendRenderedEmail({ rendered, ...input }: SendRenderedEmailInput) {
  return sendRichEmail({ ...input, ...rendered });
}
