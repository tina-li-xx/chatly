import { normalizeDashboardEmailTemplateContent } from "@/lib/email-template-content";
import { parseDashboardEmailTemplates, renderDashboardEmailTemplateFragment } from "@/lib/email-templates";

describe("email template content normalization", () => {
  it("strips legacy raw html tags from stored template bodies", () => {
    const parsed = parseDashboardEmailTemplates(
      JSON.stringify([
        {
          key: "offline_reply",
          subject: "Usechatting Support replied to your message",
          body: "We replied to your message.</div><div>{{agent_name}} from {{team_name}} just replied."
        }
      ])
    );

    expect(parsed[0]?.body).toBe("We replied to your message.\n\n{{agent_name}} from {{team_name}} just replied.");
  });

  it("keeps preview rendering free of leaked closing tags", () => {
    const fragment = renderDashboardEmailTemplateFragment(
      "We replied to your message.</div><div>{{agent_name}} from {{team_name}} just replied.",
      {
        visitorName: "Alex",
        visitorEmail: "alex@example.com",
        teamName: "Usechatting Support",
        agentName: "Tina",
        companyName: "Usechatting",
        conversationLink: "https://usechatting.com/conversation/preview",
        transcript: "Alex: Hi there",
        unsubscribeLink: "https://usechatting.com/unsubscribe"
      }
    );

    expect(normalizeDashboardEmailTemplateContent("</div><div>Hello")).toBe("Hello");
    expect(fragment.text).toBe("We replied to your message.\n\nTina from Usechatting Support just replied.");
    expect(fragment.html).not.toContain("&lt;/div&gt;");
    expect(fragment.html).not.toContain("</div><div>");
    expect(fragment.html).toContain("Tina from Usechatting Support just replied.");
  });
});
