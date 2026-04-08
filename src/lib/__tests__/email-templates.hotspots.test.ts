import {
  buildDashboardEmailTemplatePreviewContext,
  parseDashboardEmailTemplates,
  renderDashboardEmailTemplateFragment
} from "@/lib/email-templates";

describe("email templates hotspots", () => {
  it("drops invalid stored template entries and keeps valid ones", () => {
    const templates = parseDashboardEmailTemplates(
      JSON.stringify([
        null,
        { key: "offline_reply", subject: "Custom", body: "Body", enabled: false, updatedAt: "2026-03-29T00:00:00.000Z" },
        { key: "not_real", subject: "Nope" }
      ])
    );

    expect(templates.find((template) => template.key === "offline_reply")).toMatchObject({
      subject: "Custom",
      body: "Body",
      enabled: false
    });
    expect(templates).toHaveLength(5);
  });

  it("builds preview fallbacks for underscore domains and renders markdown without captions", () => {
    const context = buildDashboardEmailTemplatePreviewContext({
      profileEmail: "team@rocket_labs.io",
      profileName: "Taylor Reed"
    });
    const fragment = renderDashboardEmailTemplateFragment(
      "![](https://chatting.example/image.png)\n[Docs](https://chatting.example/docs)\n```const ok = true```",
      context,
      { highlightVariables: false }
    );

    expect(context.companyName).toBe("Rocket Labs");
    expect(fragment.html).toContain("<figure");
    expect(fragment.html).not.toContain("<figcaption");
    expect(fragment.html).toContain('href="https://chatting.example/docs"');
    expect(fragment.html).toContain("<pre");
  });
});
