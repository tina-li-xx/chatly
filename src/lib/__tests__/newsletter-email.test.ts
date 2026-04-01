const mocks = vi.hoisted(() => ({
  getPublicAppUrl: vi.fn(),
  sendRichEmail: vi.fn()
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: mocks.getPublicAppUrl
}));

vi.mock("@/lib/email", () => ({
  sendRichEmail: mocks.sendRichEmail
}));

import { sendNewsletterWelcomeEmail } from "@/lib/newsletter-email";

describe("newsletter welcome email", () => {
  it("sends the latest blog link in text and escaped html", async () => {
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com/");

    await sendNewsletterWelcomeEmail("person@example.com");

    expect(mocks.sendRichEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Chatting <hello@usechatting.com>",
        to: "person@example.com",
        subject: "You're in for Chatting blog updates",
        bodyText: expect.stringContaining("https://usechatting.com/blog"),
        bodyHtml: expect.stringContaining("href=\"https://usechatting.com/blog\"")
      })
    );
  });
});
