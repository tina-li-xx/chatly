import { renderToStaticMarkup } from "react-dom/server";
import { runMockEffects } from "./dashboard/test-react-hooks";
import { loadRemoteScriptModule } from "./script-test-utils";

describe("chatting script", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the widget script for non-local hosts", async () => {
    const { Component, reactMocks, script } = await loadRemoteScriptModule("./chatting-script", "usechatting.com", "chatting");

    reactMocks.beginRender();
    renderToStaticMarkup(<Component />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const html = renderToStaticMarkup(<Component />);

    expect(html).toContain("chatting");
    expect(script).toHaveBeenCalledWith(expect.objectContaining({
      "data-site-id": "398b43bb-dc54-403c-bedd-5f387ba07092",
      src: "https://usechatting.com/widget.js",
      strategy: "afterInteractive"
    }));
  });

  it("skips the widget script on localhost", async () => {
    const { Component, reactMocks, script } = await loadRemoteScriptModule("./chatting-script", "localhost", "chatting");

    reactMocks.beginRender();
    const firstHtml = renderToStaticMarkup(<Component />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const secondHtml = renderToStaticMarkup(<Component />);

    expect(firstHtml).not.toContain("chatting");
    expect(secondHtml).not.toContain("chatting");
    expect(script).not.toHaveBeenCalled();
  });
});
