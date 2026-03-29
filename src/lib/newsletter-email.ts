import { getPublicAppUrl } from "@/lib/env";
import { sendRichEmail } from "@/lib/email";
import { escapeHtml } from "@/lib/utils";

export async function sendNewsletterWelcomeEmail(email: string) {
  const blogUrl = `${getPublicAppUrl().replace(/\/$/, "")}/blog`;
  const escapedBlogUrl = escapeHtml(blogUrl);

  await sendRichEmail({
    to: email,
    subject: "You're in for Chatting blog updates",
    bodyText: `Thanks for subscribing to Chatting.

We'll send practical live chat tips, support playbooks, and new blog posts to this inbox.

Read the latest articles:
${blogUrl}`,
    bodyHtml: `
      <div style="font-family:Avenir Next,Segoe UI,sans-serif;line-height:1.7;color:#334155;">
        <p style="font-size:18px;font-weight:600;color:#0f172a;">Thanks for subscribing to Chatting.</p>
        <p>We'll send practical live chat tips, support playbooks, and new blog posts to this inbox.</p>
        <p style="margin-top:24px;">
          <a href="${escapedBlogUrl}" style="display:inline-block;border-radius:12px;background:#2563EB;padding:12px 18px;color:#ffffff;text-decoration:none;font-weight:600;">
            Read the latest articles
          </a>
        </p>
      </div>
    `
  });
}
