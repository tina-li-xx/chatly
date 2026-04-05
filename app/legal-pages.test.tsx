import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PrivacyPage from "./privacy/page";
import TermsPage from "./terms/page";

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

describe("legal pages", () => {
  it("renders the privacy page with the shared landing footer", () => {
    const html = renderToStaticMarkup(<PrivacyPage />);

    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Live chat for small teams.");
    expect(html).toContain("/#features");
  });

  it("renders the terms page with the shared landing footer", () => {
    const html = renderToStaticMarkup(<TermsPage />);

    expect(html).toContain("Terms of Service");
    expect(html).toContain("Live chat for small teams.");
    expect(html).toContain("/blog");
  });
});
