import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "http://localhost:3983"
}));

import HomePage, { metadata } from "./page";

describe("landing page metadata", () => {
  it("includes homepage structured data", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("application/ld+json");
    expect(html).toContain('"@type":"SoftwareApplication"');
    expect(html).toContain('"url":"http://localhost:3983"');
    expect(html).toContain('"name":"Growth"');
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('"logo":"http://localhost:3983/blog/chatting-logo.svg"');
  });

  it("includes explicit social image metadata", () => {
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3983/api/og?template=a&v=2026-04-09",
        width: 1200,
        height: 630,
        alt: "Chatting — Live chat for small teams. $20/month. No per-seat pricing."
      }
    ]);
    expect(metadata.twitter?.description).toBe(
      "See who's on your site. Answer their questions. Close the deal. Simple pricing, no per-seat games."
    );
    expect(metadata.twitter?.images).toEqual([
      {
        url: "http://localhost:3983/api/og?template=a&v=2026-04-09",
        alt: "Chatting — Live chat for small teams"
      }
    ]);
  });
});
