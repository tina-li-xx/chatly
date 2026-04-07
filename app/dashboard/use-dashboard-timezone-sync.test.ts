import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

describe("dashboard timezone sync hook", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the browser timezone once when it is valid", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const refreshMock = vi.fn();

    vi.doMock("react", () => reactMocks.moduleFactory());
    vi.doMock("next/navigation", () => ({
      useRouter: () => ({ refresh: refreshMock })
    }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", { cookie: "" });
    vi.stubGlobal("window", { location: { protocol: "https:" } });
    function MockDateTimeFormat() {
      return {
        resolvedOptions() {
          return { timeZone: "Europe/London" };
        },
        format() {
          return "";
        }
      };
    }
    vi.stubGlobal("Intl", {
      DateTimeFormat: MockDateTimeFormat
    });

    const { useDashboardTimezoneSync } = await import("./use-dashboard-timezone-sync");

    function TestComponent() {
      useDashboardTimezoneSync();
      return createElement("div", null, "sync");
    }

    reactMocks.beginRender();
    renderToStaticMarkup(createElement(TestComponent));
    await runMockEffects(reactMocks.effects);

    expect(fetchMock).toHaveBeenCalledWith("/dashboard/settings/timezone", expect.objectContaining({
      method: "POST",
      headers: { "content-type": "application/json" }
    }));
    expect(document.cookie).toContain("chatting_timezone=Europe/London");
    expect(document.cookie).toContain("SameSite=Lax");
    expect(document.cookie).toContain("Secure");
    expect(refreshMock).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ timezone: "Europe/London" }));
  });

  it("refreshes the page when asked to re-render server data after sync", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const refreshMock = vi.fn();

    vi.doMock("react", () => reactMocks.moduleFactory());
    vi.doMock("next/navigation", () => ({
      useRouter: () => ({ refresh: refreshMock })
    }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("document", { cookie: "" });
    vi.stubGlobal("window", { location: { protocol: "https:" } });
    vi.stubGlobal("Intl", {
      DateTimeFormat: function MockDateTimeFormat() {
        return {
          resolvedOptions() {
            return { timeZone: "Europe/London" };
          },
          format() {
            return "";
          }
        };
      }
    });

    const { useDashboardTimezoneSync } = await import("./use-dashboard-timezone-sync");

    function TestComponent() {
      useDashboardTimezoneSync({ refreshOnSuccess: true });
      return createElement("div", null, "sync");
    }

    reactMocks.beginRender();
    renderToStaticMarkup(createElement(TestComponent));
    await runMockEffects(reactMocks.effects);
    await fetchMock.mock.results[0]?.value;
    await Promise.resolve();
    await Promise.resolve();

    expect(refreshMock).toHaveBeenCalled();
  });
});
