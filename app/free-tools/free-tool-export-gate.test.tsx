import { renderToStaticMarkup } from "react-dom/server";
import { FreeToolExportGate } from "./free-tool-export-gate";

describe("free tool export gate", () => {
  it("renders the email export form shell", () => {
    const html = renderToStaticMarkup(
      <FreeToolExportGate
        toolSlug="live-chat-roi-calculator"
        source="free-tools-live-chat-roi"
        resultPayload={{ result: { annualRevenueLift: 51000 } }}
      />
    );

    expect(html).toContain("Send this report to your inbox");
    expect(html).toContain("Send my report");
    expect(html).toContain("email@example.com");
  });
});
