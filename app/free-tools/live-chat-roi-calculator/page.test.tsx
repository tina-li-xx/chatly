import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LiveChatRoiCalculatorRoute from "./page";

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

describe("live chat roi calculator page", () => {
  it("renders the tool hero, input panel, and contextual CTA", () => {
    const html = renderToStaticMarkup(<LiveChatRoiCalculatorRoute />);

    expect(html).toContain("Live Chat ROI Calculator");
    expect(html).toContain("Free Tools");
    expect(html).toContain("Visitors per month");
    expect(html).toContain("Enter your numbers to see your ROI");
    expect(html).toContain("Want to track this automatically?");
    expect(html).toContain("application/ld+json");
  });
});
