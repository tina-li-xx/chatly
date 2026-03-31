import { getPublicAppUrl } from "@/lib/env";
import { renderChattingEmailPage } from "@/lib/chatly-email-foundation";
import { sendRichEmail } from "@/lib/email";

export async function sendNewsletterWelcomeEmail(email: string) {
  const blogUrl = `${getPublicAppUrl().replace(/\/$/, "")}/blog`;

  await sendRichEmail({
    to: email,
    subject: "You're in for Chatting blog updates",
    bodyText: `Thanks for subscribing to Chatting.

We'll send practical live chat tips, support playbooks, and new blog posts to this inbox.

Read the latest articles:
${blogUrl}`,
    bodyHtml: renderChattingEmailPage({
      preheader: "Thanks for subscribing to Chatting.",
      title: "Thanks for subscribing to Chatting.",
      description: "We'll send practical live chat tips, support playbooks, and new blog posts to this inbox.",
      actions: { primary: { href: blogUrl, label: "Read the latest articles" }, borderTopColor: undefined }
    })
  });
}
