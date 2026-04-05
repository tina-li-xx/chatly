import { renderToStaticMarkup } from "react-dom/server";

describe("email unsubscribe page", () => {
  it("renders the unsubscribe panel for valid tokens and fallback copy otherwise", async () => {
    vi.resetModules();
    const captures: Record<string, unknown> = {};
    const getEmailUnsubscribePreferencesByToken = vi
      .fn()
      .mockResolvedValueOnce({ email: "hello@example.com", subscribed: true })
      .mockResolvedValueOnce(null);

    vi.doMock("@/lib/email-unsubscribe", () => ({ getEmailUnsubscribePreferencesByToken }));
    vi.doMock("./email-unsubscribe-panel", () => ({
      EmailUnsubscribePanel: (props: unknown) => ((captures.panel = props), <div>panel</div>)
    }));

    const module = await import("./unsubscribe/page");
    const validMarkup = renderToStaticMarkup(
      await module.default({ searchParams: Promise.resolve({ token: "token_123" }) })
    );
    const invalidMarkup = renderToStaticMarkup(
      await module.default({ searchParams: Promise.resolve({ token: "bad" }) })
    );

    expect(getEmailUnsubscribePreferencesByToken).toHaveBeenNthCalledWith(1, "token_123");
    expect(captures.panel).toMatchObject({
      email: "hello@example.com",
      initialSubscribed: true,
      token: "token_123"
    });
    expect(validMarkup).toContain("panel");
    expect(invalidMarkup).toContain("That link didn");
  });
});
