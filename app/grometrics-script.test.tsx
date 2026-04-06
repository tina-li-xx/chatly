import { renderToStaticMarkup } from "react-dom/server";
import { runMockEffects } from "./dashboard/test-react-hooks";
import { loadRemoteScriptModule } from "./script-test-utils";

describe("grometrics script", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the analytics script on non-local hosts", async () => {
    const { Component, reactMocks, script } = await loadRemoteScriptModule("./grometrics-script", "usechatting.com", "grometrics");

    reactMocks.beginRender();
    renderToStaticMarkup(<Component />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const html = renderToStaticMarkup(<Component />);

    expect(html).toContain("grometrics");
    expect(script).toHaveBeenCalledWith(expect.objectContaining({
      "data-domain": "usechatting.com",
      "data-website-id": "gm_13c7a11993d9d7ce797e06a3",
      id: "grometrics-script"
    }));
  });

  it("still loads without a consent cookie", async () => {
    const { Component, reactMocks, script } = await loadRemoteScriptModule("./grometrics-script", "usechatting.com", "grometrics");

    reactMocks.beginRender();
    renderToStaticMarkup(<Component />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const html = renderToStaticMarkup(<Component />);

    expect(html).toContain("grometrics");
    expect(script).toHaveBeenCalledWith(expect.objectContaining({
      "data-domain": "usechatting.com",
      "data-website-id": "gm_13c7a11993d9d7ce797e06a3",
      id: "grometrics-script"
    }));
  });

  it("skips the analytics script on localhost", async () => {
    const { Component, reactMocks, script } = await loadRemoteScriptModule("./grometrics-script", "localhost", "grometrics");

    reactMocks.beginRender();
    const firstHtml = renderToStaticMarkup(<Component />);
    await runMockEffects(reactMocks.effects);

    reactMocks.beginRender();
    const secondHtml = renderToStaticMarkup(<Component />);

    expect(firstHtml).not.toContain("grometrics");
    expect(secondHtml).not.toContain("grometrics");
    expect(script).not.toHaveBeenCalled();
  });
});
