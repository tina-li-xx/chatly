import { renderToStaticMarkup } from "react-dom/server";

describe("widget page client loading fallback", () => {
  it("renders the skeleton when the dynamic widget page is still loading", async () => {
    vi.resetModules();
    vi.doMock("next/dynamic", () => ({
      default: (_loader: unknown, options: { loading?: () => JSX.Element }) => () => options.loading?.()
    }));

    const { DashboardWidgetPageClient } = await import("./widget-page-client");
    const html = renderToStaticMarkup(
      <DashboardWidgetPageClient initialSites={[]} proactiveChatUnlocked={false} />
    );

    expect(html).toContain("rounded-xl border border-slate-200 bg-white p-6");
    expect(html).toContain("h-[420px] max-w-[520px]");
  });
});
