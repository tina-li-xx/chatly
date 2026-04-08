const mocks = vi.hoisted(() => ({
  getPublicAppUrl: vi.fn(),
  renderChattingEmailPage: vi.fn(() => "<html>newsletter</html>"),
  resolvePrimaryBrandHelloMailFrom: vi.fn(() => "Chatting <hello@usechatting.com>"),
  sendRenderedEmail: vi.fn()
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));

vi.mock("@/lib/chatting-email-foundation", () => ({
  renderChattingEmailPage: mocks.renderChattingEmailPage
}));

vi.mock("@/lib/mail-from-addresses", () => ({
  resolvePrimaryBrandHelloMailFrom: mocks.resolvePrimaryBrandHelloMailFrom
}));

vi.mock("@/lib/rendered-email-delivery", () => ({
  sendRenderedEmail: mocks.sendRenderedEmail
}));

import { sendNewsletterWelcomeEmail } from "@/lib/newsletter-email";

describe("newsletter welcome email", () => {
  it("sends the latest blog link in text and escaped html", async () => {
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com/");

    await sendNewsletterWelcomeEmail({
      email: "person@example.com",
      preferencesUrl: "https://usechatting.com/newsletter/preferences?token=abc"
    });

    expect(mocks.sendRenderedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Chatting <hello@usechatting.com>",
        to: "person@example.com",
        rendered: expect.objectContaining({
          subject: "You're in for Chatting blog updates",
          bodyText: expect.stringContaining("https://usechatting.com/newsletter/preferences?token=abc"),
          bodyHtml: "<html>newsletter</html>"
        })
      })
    );
    expect(mocks.renderChattingEmailPage).toHaveBeenCalledWith(
      expect.objectContaining({
        actions: expect.objectContaining({
          secondary: expect.objectContaining({
            href: "https://usechatting.com/newsletter/preferences?token=abc",
            label: "Manage preferences"
          })
        })
      })
    );
  });
});
