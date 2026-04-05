import { renderToStaticMarkup } from "react-dom/server";

describe("newsletter preferences page", () => {
  it("renders the preferences panel for valid tokens and fallback copy otherwise", async () => {
    vi.resetModules();
    const captures: Record<string, unknown> = {};
    const getNewsletterPreferencesByToken = vi
      .fn()
      .mockResolvedValueOnce({ email: "hello@example.com", subscribed: true })
      .mockResolvedValueOnce(null);

    vi.doMock("@/lib/data/newsletter", () => ({ getNewsletterPreferencesByToken }));
    vi.doMock("./newsletter-preferences-panel", () => ({
      NewsletterPreferencesPanel: (props: unknown) => ((captures.panel = props), <div>panel</div>)
    }));

    const module = await import("./preferences/page");
    const validMarkup = renderToStaticMarkup(
      await module.default({ searchParams: Promise.resolve({ token: "token_123" }) })
    );
    const invalidMarkup = renderToStaticMarkup(
      await module.default({ searchParams: Promise.resolve({ token: "bad" }) })
    );

    expect(getNewsletterPreferencesByToken).toHaveBeenNthCalledWith(1, "token_123");
    expect(captures.panel).toMatchObject({
      email: "hello@example.com",
      initialSubscribed: true,
      token: "token_123"
    });
    expect(validMarkup).toContain("panel");
    expect(invalidMarkup).toContain("That link didn");
  });
});
