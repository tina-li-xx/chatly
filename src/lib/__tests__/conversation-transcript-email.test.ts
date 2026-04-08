import {
  buildConversationTranscriptPreviewMessages,
  renderConversationTranscriptEmailTemplate
} from "@/lib/conversation-transcript-email";
import { buildDashboardEmailTemplatePreviewContext } from "@/lib/email-templates";

describe("conversation transcript email renderer", () => {
  const previewContext = buildDashboardEmailTemplatePreviewContext({
    profileEmail: "sarah@chatting.example",
    profileName: "Sarah Chen"
  });

  it("renders the guided transcript layout with message bubbles and branded footer", () => {
    const rendered = renderConversationTranscriptEmailTemplate(
      {
        subject: "Your conversation with {{team_name}}",
        body: "Thanks for chatting with us! Here's a copy of your conversation for your records.\n\n{{transcript}}"
      },
      previewContext,
      {
        appUrl: "https://chatting.example",
        conversationUrl: "https://chatting.example/conversation/token",
        replyToEmail: "reply@acme.example",
        messages: buildConversationTranscriptPreviewMessages(),
        teamAvatarUrl: null,
        showViralFooter: true
      }
    );

    expect(rendered.subject).toBe("Your conversation with Chatting Team");
    expect(rendered.bodyText).toContain("March 15, 2026 • 3 messages");
    expect(rendered.bodyText).toContain("Reply to This Email: mailto:reply@acme.example");
    expect(rendered.bodyText).toContain("Continue on the web: https://chatting.example/conversation/token");
    expect(rendered.bodyText).toContain("Try Chatting Free →");
    expect(rendered.bodyHtml).toContain("background:#F1F5F9");
    expect(rendered.bodyHtml).toContain("Georgia,'Times New Roman',serif");
    expect(rendered.bodyHtml).toContain("border-radius:12px 12px 12px 4px");
    expect(rendered.bodyHtml).toContain("border-radius:12px 12px 4px 12px");
    expect(rendered.bodyHtml).toContain(">Chatting</td>");
    expect(rendered.bodyHtml).toContain("Powered by <strong style=\"color:#475569;\">Chatting</strong>");
    expect(rendered.bodyHtml.indexOf(">Try Chatting Free →<")).toBeGreaterThan(
      rendered.bodyHtml.indexOf(">Continue on the web<")
    );
  });

  it("hides Chatting footer sections for unbranded paid transcripts", () => {
    const rendered = renderConversationTranscriptEmailTemplate(
      {
        subject: "Your conversation with {{team_name}}",
        body: "Thanks for chatting with us! Here's a copy of your conversation for your records.\n\n{{transcript}}"
      },
      previewContext,
      {
        appUrl: "https://chatting.example",
        conversationUrl: "https://chatting.example/conversation/token",
        replyToEmail: "reply@acme.example",
        messages: buildConversationTranscriptPreviewMessages(),
        teamAvatarUrl: null,
        showViralFooter: false
      }
    );

    expect(rendered.bodyText).not.toContain("Try Chatting Free");
    expect(rendered.bodyText).not.toContain("This email was sent by");
    expect(rendered.bodyHtml).not.toContain("Powered by <strong");
    expect(rendered.bodyHtml).not.toContain("Privacy Policy");
  });

  it("falls back to initials when the team avatar is a remote image URL", () => {
    const rendered = renderConversationTranscriptEmailTemplate(
      {
        subject: "Your conversation with {{team_name}}",
        body: "Thanks for chatting with us! Here's a copy of your conversation for your records.\n\n{{transcript}}"
      },
      previewContext,
      {
        appUrl: "https://chatting.example",
        conversationUrl: "https://chatting.example/conversation/token",
        replyToEmail: "reply@acme.example",
        messages: buildConversationTranscriptPreviewMessages(),
        teamAvatarUrl: "https://cdn.chatting.example/team-avatar.png",
        showViralFooter: false
      }
    );

    expect(rendered.bodyHtml).not.toContain("cdn.chatting.example/team-avatar.png");
    expect(rendered.bodyHtml).toContain(">CT</td>");
  });
});
