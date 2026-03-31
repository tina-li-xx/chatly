import {
  formatEmailTemplateTimestamp,
  getDefaultDashboardEmailTemplates,
  buildDashboardEmailTemplatePreviewContext,
  parseDashboardEmailTemplates,
  renderDashboardEmailTemplate,
  renderDashboardEmailTemplateFragment,
  serializeDashboardEmailTemplates
} from "@/lib/email-templates";

describe("email templates", () => {
  const previewContext = buildDashboardEmailTemplatePreviewContext({
    profileEmail: "sarah@chatly.example",
    profileName: "Sarah Chen"
  });

  it("renders the shared styled email shell when requested", () => {
    const rendered = renderDashboardEmailTemplate(
      {
        subject: "Hello {{visitor_name}}",
        body: "Thanks for reaching out to **{{team_name}}**."
      },
      previewContext,
      {
        includeShell: true
      }
    );

    expect(rendered.subject).toBe("Hello Alex");
    expect(rendered.bodyText).toContain("Thanks for reaching out to **Chatting Team**.");
    expect(rendered.bodyHtml).toContain("max-width:600px");
    expect(rendered.bodyHtml).toContain("<strong>Chatting Team</strong>");
  });

  it("renders shared supplemental sections into both html and text output", () => {
    const rendered = renderDashboardEmailTemplate(
      {
        subject: "Checking in",
        body: "Hi {{visitor_name}},"
      },
      previewContext,
      {
        includeShell: true,
        sections: [
          {
            type: "plain",
            tone: "soft",
            text: "Best,\nChatting Team",
            html: "Best,<br />Chatting Team"
          },
          {
            type: "actions",
            title: "Helpful?",
            textTitle: "Helpful?",
            links: [
              { label: "Yes", href: "https://chatly.example/yes" },
              { label: "No", href: "https://chatly.example/no" }
            ]
          }
        ]
      }
    );

    expect(rendered.bodyText).toContain("Best,\nChatting Team");
    expect(rendered.bodyText).toContain("Helpful?");
    expect(rendered.bodyText).toContain("Yes: https://chatly.example/yes");
    expect(rendered.bodyHtml).toContain("Best,<br />Chatting Team");
    expect(rendered.bodyHtml).toContain('href="https://chatly.example/yes"');
    expect(rendered.bodyHtml).toContain(">Helpful?</div>");
  });

  it("ships the updated default transcript copy", () => {
    const transcriptTemplate = getDefaultDashboardEmailTemplates().find(
      (template) => template.key === "conversation_transcript"
    );

    expect(transcriptTemplate).toMatchObject({
      subject: "Your conversation with {{team_name}}"
    });
    expect(transcriptTemplate?.body).toContain(
      "Thanks for chatting with us! Here's a copy of your conversation for your records."
    );
    expect(transcriptTemplate?.body).not.toContain("If you need anything else");
  });

  it("ships the updated default satisfaction survey copy", () => {
    const surveyTemplate = getDefaultDashboardEmailTemplates().find((template) => template.key === "satisfaction_survey");

    expect(surveyTemplate?.body).not.toContain("A couple important details:");
    expect(surveyTemplate?.body).not.toContain("There is no comment field here");
  });

  it("parses stored templates safely and serializes missing values back to defaults", () => {
    const parsed = parseDashboardEmailTemplates(
      JSON.stringify([
        { key: "offline_reply", subject: " ", body: "Custom body", enabled: false, updatedAt: "2026-03-29T00:00:00.000Z" },
        { key: "unknown", subject: "Nope" }
      ])
    );
    const serialized = JSON.parse(
      serializeDashboardEmailTemplates([
        { ...parsed[0], subject: "Saved subject", body: "", enabled: false, updatedAt: "2026-03-30T00:00:00.000Z" }
      ])
    ) as Array<{ key: string; subject: string; body: string; enabled: boolean }>;

    expect(parseDashboardEmailTemplates("not json")).toHaveLength(5);
    expect(parsed[0]).toMatchObject({
      key: "offline_reply",
      subject: "{{team_name}} replied to your message",
      body: "Custom body",
      enabled: false
    });
    expect(serialized[0]).toMatchObject({
      key: "offline_reply",
      subject: "Saved subject",
      enabled: false
    });
    expect(serialized[1].subject).toBe("Your conversation with {{team_name}}");
  });

  it("renders template fragments with highlighted variables, markdown, links, images, and code blocks", () => {
    const fragment = renderDashboardEmailTemplateFragment(
      [
        "Hi **{{team_name}}**",
        "__Heads up__ and *thanks*",
        "[Open](https://chatly.example/open)",
        "![Screenshot](https://chatly.example/image.png)",
        "```console.log('hi')```"
      ].join("\n"),
      previewContext,
      { highlightVariables: true }
    );

    expect(fragment.text).toContain("Hi **Chatting Team**");
    expect(fragment.html).toContain("<strong>");
    expect(fragment.html).toContain("<u>Heads up</u>");
    expect(fragment.html).toContain("<em>thanks</em>");
    expect(fragment.html).toContain('href="https://chatly.example/open"');
    expect(fragment.html).toContain("<figure");
    expect(fragment.html).toContain("<pre");
    expect(fragment.html).toContain("<mark");
  });

  it("renders conversation placeholders as inline anchors for both default and legacy copy", () => {
    const welcomeTemplate = getDefaultDashboardEmailTemplates().find((template) => template.key === "welcome_email");
    const defaultFragment = renderDashboardEmailTemplateFragment(welcomeTemplate?.body ?? "", previewContext, {
      highlightVariables: true
    });
    const legacyFragment = renderDashboardEmailTemplateFragment(
      [
        "If you ever want to continue the conversation, you can jump back in here:",
        "{{conversation_link}}"
      ].join("\n"),
      previewContext,
      { highlightVariables: true }
    );

    expect(welcomeTemplate?.body).toContain("[jump back in here]({{conversation_link}})");
    expect(defaultFragment.html).toContain(">jump back in here</a>");
    expect(defaultFragment.html).toContain(`href="${previewContext.conversationLink}"`);
    expect(legacyFragment.html).toContain(">jump back in here</a>");
    expect(legacyFragment.html).toContain(`href="${previewContext.conversationLink}"`);
  });

  it("renders standalone conversation-link lines as a button", () => {
    const fragment = renderDashboardEmailTemplateFragment(
      [
        "Continue the conversation here:",
        "{{conversation_link}}"
      ].join("\n"),
      previewContext,
      { highlightVariables: true }
    );

    expect(fragment.text).toContain("Continue the conversation here:");
    expect(fragment.text).toContain(previewContext.conversationLink);
    expect(fragment.html).toContain(">Continue the conversation</a>");
    expect(fragment.html).toContain(`href="${previewContext.conversationLink}"`);
    expect(fragment.html).not.toContain(">Continue the conversation here:</a>");
  });

  it("builds preview context and timestamps with the right brand fallbacks", () => {
    const branded = buildDashboardEmailTemplatePreviewContext({
      profileEmail: "support@acme.io",
      profileName: "Tina Bauer"
    });
    const fallback = buildDashboardEmailTemplatePreviewContext({
      profileEmail: "hello@chatly.example",
      profileName: "   "
    });

    expect(branded).toMatchObject({
      companyName: "Acme",
      teamName: "Acme Support",
      agentName: "Tina"
    });
    expect(branded.conversationLink).toMatch(/^https:\/\/chatly\.example\/conversation\/.+\..+$/);
    expect(fallback).toMatchObject({
      companyName: "Chatting",
      teamName: "Chatting Team",
      agentName: "Sarah"
    });
    expect(fallback.conversationLink).toMatch(/^https:\/\/chatly\.example\/conversation\/.+\..+$/);
    expect(formatEmailTemplateTimestamp(null)).toBe("Default template");
    expect(formatEmailTemplateTimestamp("2026-03-29T00:00:00.000Z")).toBe("29 Mar 2026");
  });
});
