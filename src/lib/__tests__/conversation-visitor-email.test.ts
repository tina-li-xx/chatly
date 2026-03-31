import { buildConversationFeedbackLinks } from "@/lib/conversation-feedback";
import { renderVisitorConversationEmailTemplate } from "@/lib/conversation-visitor-email";
import { buildDashboardEmailTemplatePreviewContext } from "@/lib/email-templates";

describe("visitor conversation email renderer", () => {
  const previewContext = buildDashboardEmailTemplatePreviewContext({
    profileEmail: "sarah@chatly.example",
    profileName: "Sarah Chen"
  });

  it("renders branded offline replies with the new visitor shell and footer", () => {
    const rendered = renderVisitorConversationEmailTemplate(
      {
        subject: "{{team_name}} replied to your message",
        body: "We replied to your message.\n\n{{transcript}}\n\nOr just reply to this email and it goes straight to us."
      },
      previewContext,
      {
        templateKey: "offline_reply",
        appUrl: "https://chatly.example",
        conversationUrl: "https://chatly.example/conversation/token",
        replyToEmail: "reply@acme.example",
        teamAvatarUrl: null,
        showViralFooter: true
      }
    );

    expect(rendered.subject).toBe("Chatting Team replied to your message");
    expect(rendered.bodyText).toContain("Alex: Hi there");
    expect(rendered.bodyText).toContain("Reply to This Email: mailto:reply@acme.example");
    expect(rendered.bodyText).toContain("Continue on the web: https://chatly.example/conversation/token");
    expect(rendered.bodyText).toContain("utm_source=visitor_email");
    expect(rendered.bodyHtml).toContain("Need more help? Continue this conversation anytime.");
    expect(rendered.bodyHtml).toContain(">Alex: Hi there<");
    expect(rendered.bodyHtml).not.toContain("white-space:pre-line");
    expect(rendered.bodyHtml).toContain(">Chatting</td>");
    expect(rendered.bodyHtml).toContain("Powered by <strong style=\"color:#475569;\">Chatting</strong>");
  });

  it("keeps satisfaction surveys unbranded and points to star rating links", () => {
    const rendered = renderVisitorConversationEmailTemplate(
      {
        subject: "How did we do?",
        body: "We'd love your feedback on your recent conversation with {{agent_name}}."
      },
      previewContext,
      {
        templateKey: "satisfaction_survey",
        appUrl: "https://chatly.example",
        conversationUrl: "https://chatly.example/conversation/token",
        replyToEmail: "reply@acme.example",
        teamAvatarUrl: null,
        showViralFooter: true,
        feedbackLinks: buildConversationFeedbackLinks("https://chatly.example", "conv_123")
      }
    );

    expect(rendered.bodyText).toContain("1 star: https://chatly.example/feedback?conversationId=conv_123&rating=1");
    expect(rendered.bodyText).toContain("5 stars: https://chatly.example/feedback?conversationId=conv_123&rating=5");
    expect(rendered.bodyText).not.toContain("Try Chatting Free");
    expect(rendered.bodyHtml).not.toContain("Powered by <strong");
    expect(rendered.bodyHtml).toContain(">5<");
  });
});
