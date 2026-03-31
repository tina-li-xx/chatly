import {
  buildDashboardEmailTemplatePreviewContext,
  parseDashboardEmailTemplates,
  renderDashboardEmailTemplate,
  renderDashboardEmailTemplateFragment,
  resolveDashboardEmailTemplateValue,
  serializeDashboardEmailTemplates
} from "@/lib/email-templates";

describe("email templates edge cases", () => {
  it("falls back to defaults when stored templates are empty or malformed", () => {
    expect(parseDashboardEmailTemplates(null)).toHaveLength(5);
    expect(parseDashboardEmailTemplates('{"no":"array"}')[0]?.key).toBe("offline_reply");

    const serialized = JSON.parse(
      serializeDashboardEmailTemplates([
        {
          key: "offline_reply",
          name: "Offline reply",
          description: "",
          trigger: "",
          icon: "mail",
          subject: "  ",
          body: "  ",
          enabled: undefined as never,
          updatedAt: ""
        }
      ] as never)
    ) as Array<{ key: string; subject: string; body: string; enabled: boolean; updatedAt: string | null }>;

    expect(serialized[0]).toMatchObject({
      key: "offline_reply",
      subject: "{{team_name}} replied to your message",
      enabled: true,
      updatedAt: null
    });
  });

  it("builds preview context fallbacks for invalid and hyphenated domains", () => {
    expect(
      buildDashboardEmailTemplatePreviewContext({
        profileEmail: "hello",
        profileName: "   "
      })
    ).toMatchObject({
      companyName: "Chatting",
      teamName: "Chatting Team",
      agentName: "Sarah"
    });
    expect(
      buildDashboardEmailTemplatePreviewContext({
        profileEmail: "team@rocket-labs.io",
        profileName: "Taylor Reed"
      })
    ).toMatchObject({
      companyName: "Rocket Labs",
      teamName: "Rocket Labs Support",
      agentName: "Taylor"
    });
    expect(
      buildDashboardEmailTemplatePreviewContext({
        profileEmail: "team@rocket-labs.io",
        profileName: "Taylor Reed"
      }).conversationLink
    ).toMatch(/^https:\/\/chatly\.example\/conversation\/.+\..+$/);
  });

  it("renders plain fragments without variable highlighting and resolves raw values", () => {
    const context = buildDashboardEmailTemplatePreviewContext({
      profileEmail: "team@acme.io",
      profileName: "Taylor Reed"
    });

    const fragment = renderDashboardEmailTemplateFragment(
      "[Open](https://chatly.example/open)\n![ ](https://chatly.example/image.png)",
      context
    );

    expect(fragment.html).not.toContain("<mark");
    expect(fragment.html).toContain("<figure");
    expect(resolveDashboardEmailTemplateValue("Hi {{visitor_name}} from {{team_name}}", context)).toBe(
      "Hi Alex from Acme Support"
    );
  });

  it("renders templates without the outer shell when includeShell is false", () => {
    const context = buildDashboardEmailTemplatePreviewContext({
      profileEmail: "team@acme.io",
      profileName: "Taylor Reed"
    });
    const rendered = renderDashboardEmailTemplate(
      {
        subject: "Hello {{visitor_name}}",
        body: "Welcome to {{company_name}}"
      },
      context,
      { includeShell: false }
    );

    expect(rendered.bodyText).toContain("Welcome to Acme");
    expect(rendered.bodyHtml).not.toContain("max-width:640px");
  });
});
