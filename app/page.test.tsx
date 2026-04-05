import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "http://localhost:3983"
}));

import HomePage from "./page";
import { metadata } from "./page";

describe("landing page", () => {
  it("renders the main marketing sections", () => {
    const html = renderToStaticMarkup(<HomePage />);
    const coreFeaturesIndex = html.indexOf("Four features that pay for themselves.");
    const comparisonIndex = html.indexOf("Built for small teams. Not stripped-down enterprise software.");

    expect(html).toContain("Live chat");
    expect(html).toContain("is revenue you lose.");
    expect(html).toContain("Your contact form is a conversion killer.");
    expect(html).toContain("2,400+ teams use Chatting to catch visitors before they bounce.");
    expect(html).toContain("Built for small teams. Not stripped-down enterprise software.");
    expect(html).toContain("Four features that pay for themselves.");
    expect(html).toContain("Know who you&#x27;re talking to");
    expect(html).toContain("Everything else you&#x27;d expect.");
    expect(html).toContain("Nothing you don&#x27;t need.");
    expect(html).toContain("Trusted by small teams across");
    expect(html).toContain("Send proactive messages on high-intent pages, auto-reply when you&#x27;re away, suggest FAQs before handoff, and route new conversations to the right teammate.");
    expect(html).toContain("Live in 3 minutes. Seriously.");
    expect(coreFeaturesIndex).toBeGreaterThan(-1);
    expect(comparisonIndex).toBeGreaterThan(coreFeaturesIndex);
  });

  it("renders the sticky header with a mobile nav row", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("sticky top-0 z-50");
    expect(html).not.toContain("lg:fixed");
    expect(html).toContain("order-3 w-full overflow-x-auto");
    expect(html).toContain("Features");
    expect(html).toContain("Pricing");
    expect(html).toContain("How it works");
    expect(html).toContain("Free Tools");
    expect(html).toContain("Blog");
    expect(html).toContain("Start 14 day free trial");
  });

  it("renders the install snippet using the public app url", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("http://localhost:3983/widget.js");
    expect(html).toContain("data-site-id=&quot;your-site-id&quot;");
  });

  it("includes an explicit social image for link previews", () => {
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "http://localhost:3983/api/og?template=a",
        width: 1200,
        height: 630,
        alt: "Chatting — Live chat for small teams who care."
      }
    ]);
    expect(metadata.twitter?.images).toEqual(["http://localhost:3983/api/og?template=a"]);
  });
});
