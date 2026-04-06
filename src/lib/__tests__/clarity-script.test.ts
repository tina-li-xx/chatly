import { buildClarityBootstrapScript } from "@/lib/clarity-script";

describe("clarity script", () => {
  it("builds the plain clarity bootstrap snippet", () => {
    const script = buildClarityBootstrapScript("project-123");

    expect(script).toContain("https://www.clarity.ms/tag/");
    expect(script).toContain("project-123");
    expect(script).not.toContain("consentv2");
    expect(script).not.toContain("analytics_consent");
  });
});
