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

    vi.doMock("react", () => reactMocks.moduleFactory());
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {});
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
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ timezone: "Europe/London" }));
  });
});
