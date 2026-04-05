import { renderToStaticMarkup } from "react-dom/server";
import { runMockEffects } from "./dashboard/test-react-hooks";
import { loadRemoteScriptModule } from "./script-test-utils";

describe("clarity script", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads Clarity for non-local hosts", async () => {
    const { Component, reactMocks, script } = await loadRemoteScriptModule("./clarity-script", "usechatting.com", "clarity");

    reactMocks.beginRender();
    renderToStaticMarkup(<Component />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const html = renderToStaticMarkup(<Component />);

    expect(html).toContain("clarity");
    expect(script).toHaveBeenCalledWith(expect.objectContaining({
      id: "clarity-script",
      strategy: "afterInteractive",
      children: expect.stringContaining('"clarity", "script", "w6jk7x5ywu"')
    }));
  });

  it("skips Clarity on localhost", async () => {
    const { Component, reactMocks, script } = await loadRemoteScriptModule("./clarity-script", "localhost", "clarity");

    reactMocks.beginRender();
    const firstHtml = renderToStaticMarkup(<Component />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const secondHtml = renderToStaticMarkup(<Component />);

    expect(firstHtml).not.toContain("clarity");
    expect(secondHtml).not.toContain("clarity");
    expect(script).not.toHaveBeenCalled();
  });
});
