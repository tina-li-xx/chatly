import type { ReactNode } from "react";

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://usechatting.com"
}));

vi.mock("@/lib/email-unsubscribe", () => ({
  getEmailUnsubscribePreferencesByToken: vi.fn()
}));

vi.mock("@/lib/data/newsletter", () => ({
  getNewsletterPreferencesByToken: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  listHelpCenterArticlesForSite: vi.fn(),
  getHelpCenterArticleForSite: vi.fn(),
  recordFeedback: vi.fn()
}));

vi.mock("@/lib/conversation-feedback", () => ({
  parseConversationRating: vi.fn()
}));

vi.mock("@/lib/auth-email-verification", () => ({
  verifyEmailWithToken: vi.fn()
}));

vi.mock("./email/email-unsubscribe-panel", () => ({
  EmailUnsubscribePanel: () => <div />
}));

vi.mock("./newsletter/newsletter-preferences-panel", () => ({
  NewsletterPreferencesPanel: () => <div />
}));

vi.mock("./help/help-center-shell", () => ({
  HelpCenterBody: () => <div />,
  HelpCenterShell: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  formatHelpCenterDate: () => "Apr 6, 2026"
}));

import { metadata as emailUnsubscribeMetadata } from "./email/unsubscribe/page";
import { metadata as feedbackMetadata } from "./feedback/page";
import { metadata as helpArticleMetadata } from "./help/[siteId]/[slug]/page";
import { metadata as helpIndexMetadata } from "./help/[siteId]/page";
import { metadata as newsletterPreferencesMetadata } from "./newsletter/preferences/page";
import { metadata as privacyMetadata } from "./privacy/page";
import { metadata as termsMetadata } from "./terms/page";
import { metadata as verifyMetadata } from "./verify/page";

describe("public seo metadata", () => {
  it("marks utility and hosted help pages as noindex", () => {
    for (const metadata of [
      emailUnsubscribeMetadata,
      newsletterPreferencesMetadata,
      feedbackMetadata,
      verifyMetadata,
      helpIndexMetadata,
      helpArticleMetadata
    ]) {
      expect(metadata.robots).toMatchObject({
        index: false,
        follow: false
      });
    }
  });

  it("exposes canonical urls for the legal pages", () => {
    expect(String(privacyMetadata.alternates?.canonical)).toBe("https://usechatting.com/privacy");
    expect(String(termsMetadata.alternates?.canonical)).toBe("https://usechatting.com/terms");
  });

  it("permanently redirects the legacy roi calculator route", async () => {
    vi.resetModules();
    const permanentRedirect = vi.fn();
    vi.doMock("next/navigation", () => ({
      permanentRedirect
    }));

    const module = await import("./tools/live-chat-roi-calculator/page");
    module.default();

    expect(permanentRedirect).toHaveBeenCalledWith("/free-tools/live-chat-roi-calculator");
  });
});
