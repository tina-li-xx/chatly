import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  )
}));

import Loading from "./loading";
import { OnboardingCustomizeTransitionScreen } from "./onboarding-customize-transition-screen";

describe("onboarding screens", () => {
  it("renders the loading shell through the customize transition screen", () => {
    const html = renderToStaticMarkup(<Loading />);

    expect(html).toContain("Loading setup...");
    expect(html).toContain("Opening your widget setup now.");
    expect(html).toContain("yoursite.com");
  });

  it("normalizes the website host and renders the setup preview", () => {
    const html = renderToStaticMarkup(
      <OnboardingCustomizeTransitionScreen
        websiteUrl="https://docs.usechatting.com/path"
        siteName="Docs"
        title="Customize"
        description="Opening your widget setup now."
        buttonLabel="Continue"
      />
    );

    expect(html).toContain("docs.usechatting.com");
    expect(html).toContain("Talk to the team");
    expect(html).toContain("Continue");
  });
});
