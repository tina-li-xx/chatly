import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ResponseTemplateLibraryRoute from "./response-template-library/page";
import ResponseTimeCalculatorRoute from "./response-time-calculator/page";
import ResponseToneCheckerRoute from "./response-tone-checker/page";
import WelcomeMessageGeneratorRoute from "./welcome-message-generator/page";

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

describe("additional free tool routes", () => {
  it("renders the response time calculator", () => {
    const html = renderToStaticMarkup(<ResponseTimeCalculatorRoute />);
    expect(html).toContain("Response Time Calculator");
    expect(html).toContain("Average response time");
  });

  it("renders the welcome message generator", () => {
    const html = renderToStaticMarkup(<WelcomeMessageGeneratorRoute />);
    expect(html).toContain("Welcome Message Generator");
    expect(html).toContain("Generate variations");
  });

  it("renders the response template library", () => {
    const html = renderToStaticMarkup(<ResponseTemplateLibraryRoute />);
    expect(html).toContain("Response Template Library");
    expect(html).toContain("Search templates");
  });

  it("renders the response tone checker", () => {
    const html = renderToStaticMarkup(<ResponseToneCheckerRoute />);
    expect(html).toContain("Response Tone Checker");
    expect(html).toContain("Analyze tone");
  });
});
