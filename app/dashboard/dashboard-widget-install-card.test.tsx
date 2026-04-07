import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

async function loadInstallCard() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("./dashboard-shell", () => ({
    DashboardLink: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
  }));

  const module = await import("./dashboard-widget-install-card");
  return { DashboardWidgetInstallCard: module.DashboardWidgetInstallCard, reactMocks };
}

describe("dashboard widget install card", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as { window?: Window & typeof globalThis }).window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      __chattingMountedSiteIds: []
    } as unknown as Window & typeof globalThis;
  });

  it("renders nothing when the widget is already live", async () => {
    const { DashboardWidgetInstallCard, reactMocks } = await loadInstallCard();
    reactMocks.beginRender();

    const html = renderToStaticMarkup(
      <DashboardWidgetInstallCard initialInstalled siteIds={["site_1"]} />
    );

    expect(html).toBe("");
  });

  it("hides the card immediately when the site is already mounted", async () => {
    const { DashboardWidgetInstallCard, reactMocks } = await loadInstallCard();
    window.__chattingMountedSiteIds = ["site_1"];
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardWidgetInstallCard initialInstalled={false} siteIds={["site_1"]} />);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();

    const html = renderToStaticMarkup(
      <DashboardWidgetInstallCard initialInstalled={false} siteIds={["site_1"]} />
    );

    expect(html).toBe("");
    expect(window.addEventListener).not.toHaveBeenCalled();
  });

  it("keeps the install CTA until a matching mounted event arrives", async () => {
    const { DashboardWidgetInstallCard, reactMocks } = await loadInstallCard();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardWidgetInstallCard initialInstalled={false} siteIds={["site_1"]} />);
    const cleanups = await runMockEffects(reactMocks.effects);
    const mountedListener = vi.mocked(window.addEventListener).mock.calls[0]?.[1] as (event: Event) => void;

    expect(renderToStaticMarkup(
      <DashboardWidgetInstallCard initialInstalled={false} siteIds={["site_1"]} />
    )).toContain("Check installation");

    mountedListener(new CustomEvent("chatting:widget:mounted", { detail: { siteId: "site_1" } }));
    reactMocks.beginRender();
    const installedHtml = renderToStaticMarkup(
      <DashboardWidgetInstallCard initialInstalled={false} siteIds={["site_1"]} />
    );
    cleanups[0]?.();

    expect(installedHtml).toBe("");
    expect(window.removeEventListener).toHaveBeenCalledWith("chatting:widget:mounted", mountedListener);
  });
});
