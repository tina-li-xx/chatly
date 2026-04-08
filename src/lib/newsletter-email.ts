import { getPublicAppUrl } from "@/lib/env";
import { renderChattingEmailPage } from "@/lib/chatting-email-foundation";
import { resolvePrimaryBrandHelloMailFrom } from "@/lib/mail-from-addresses";
import { sendRenderedEmail } from "@/lib/rendered-email-delivery";

export async function sendNewsletterWelcomeEmail(input: {
  email: string;
  preferencesUrl: string;
}) {
  const blogUrl = `${getPublicAppUrl().replace(/\/$/, "")}/blog`;

  await sendRenderedEmail({
    from: resolvePrimaryBrandHelloMailFrom(),
    to: input.email,
    emailCategory: "critical",
    footerTeamName: "Chatting",
    rendered: {
      subject: "You're in for Chatting blog updates",
      bodyText: `Thanks for subscribing to Chatting.

We'll send practical live chat tips, support playbooks, and new blog posts to this inbox.

Read the latest articles:
${blogUrl}

Manage preferences:
${input.preferencesUrl}`,
      bodyHtml: renderChattingEmailPage({
        preheader: "Thanks for subscribing to Chatting.",
        title: "Thanks for subscribing to Chatting.",
        description: "We'll send practical live chat tips, support playbooks, and new blog posts to this inbox.",
        actions: {
          primary: { href: blogUrl, label: "Read the latest articles" },
          secondary: { href: input.preferencesUrl, label: "Manage preferences" },
          borderTopColor: undefined
        }
      })
    }
  });
}
