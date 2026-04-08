describe("dashboard widget snippet", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  afterEach(() => {
    vi.resetModules();
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
  });

  it("builds the widget snippet from the configured app url", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://chatting.example";
    const { getWidgetSnippet } = await import("@/lib/dashboard");

    const snippet = getWidgetSnippet({ id: "site_123" } as never);
    expect(snippet).toContain('src="https://chatting.example/widget.js"');
    expect(snippet).toContain('data-site-id="site_123"');
  });
});
