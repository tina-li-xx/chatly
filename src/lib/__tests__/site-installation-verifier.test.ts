import { verifySiteWidgetSnippet } from "@/lib/site-installation-verifier";

describe("site installation verifier", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the final detected response url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        url: "https://www.example.com/pricing",
        text: vi.fn().mockResolvedValue('<script src="/widget.js" data-site-id="site_123"></script>')
      })
    );

    await expect(
      verifySiteWidgetSnippet({
        domain: "example.com",
        siteId: "site_123"
      })
    ).resolves.toEqual({
      ok: true,
      url: "https://www.example.com/pricing"
    });
  });
});
