import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/dynamic", () => ({
  default: (_loader: unknown, _options: unknown) =>
    ({ initialSites, proactiveChatUnlocked }: { initialSites: unknown; proactiveChatUnlocked: unknown }) =>
      <div data-sites={JSON.stringify(initialSites)} data-proactive-chat={JSON.stringify(proactiveChatUnlocked)}>dynamic-widget</div>
}));

import { DashboardWidgetPageClient } from "./widget-page-client";

describe("widget page client", () => {
  it("forwards initial widget props into the dynamically loaded page", () => {
    const html = renderToStaticMarkup(
      <DashboardWidgetPageClient
        initialSites={[{ id: "site_1" }] as never}
        proactiveChatUnlocked
      />
    );

    expect(html).toContain("dynamic-widget");
    expect(html).toContain("site_1");
    expect(html).toContain("true");
  });
});
