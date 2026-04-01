import {
  CHATTING_EMAIL_ADDRESSES_BY_SUBDOMAIN,
  resolveConversationTemplateMailFrom,
  resolveDailyDigestMailFrom,
  resolveImmediateTeamNotificationMailFrom,
  resolvePrimaryBrandHelloMailFrom,
  resolvePrimaryBrandNoReplyMailFrom,
  resolveProductUpdatesMailFrom,
  resolveTeamInvitationMailFrom,
  resolveWeeklyPerformanceReportMailFrom
} from "@/lib/mail-from-addresses";

describe("mail from addresses", () => {
  it("keeps the subdomain catalog aligned with the production sender plan", () => {
    expect(CHATTING_EMAIL_ADDRESSES_BY_SUBDOMAIN).toEqual({
      "usechatting.com": {
        hello: "hello@usechatting.com",
        noreply: "noreply@usechatting.com",
        updates: "updates@usechatting.com"
      },
      "mail.usechatting.com": {
        noreply: "noreply@mail.usechatting.com"
      },
      "notifications.usechatting.com": {
        noreply: "noreply@notifications.usechatting.com",
        digest: "digest@notifications.usechatting.com",
        reports: "reports@notifications.usechatting.com"
      }
    });
  });

  it("resolves brand, visitor, and notification senders with the expected display names", () => {
    expect(resolvePrimaryBrandHelloMailFrom()).toBe("Chatting <hello@usechatting.com>");
    expect(resolvePrimaryBrandNoReplyMailFrom()).toBe("Chatting <noreply@usechatting.com>");
    expect(resolveProductUpdatesMailFrom()).toBe("Chatting <updates@usechatting.com>");
    expect(resolveTeamInvitationMailFrom("Tina")).toBe("Tina via Chatting <noreply@usechatting.com>");
    expect(resolveConversationTemplateMailFrom("welcome_email", "Heypond site")).toBe(
      "Chatting <hello@usechatting.com>"
    );
    expect(resolveConversationTemplateMailFrom("conversation_transcript", "Heypond site")).toBe(
      "Heypond site via Chatting <noreply@mail.usechatting.com>"
    );
    expect(resolveImmediateTeamNotificationMailFrom()).toBe(
      "Chatting <noreply@notifications.usechatting.com>"
    );
    expect(resolveDailyDigestMailFrom()).toBe("Chatting <digest@notifications.usechatting.com>");
    expect(resolveWeeklyPerformanceReportMailFrom()).toBe(
      "Chatting <reports@notifications.usechatting.com>"
    );
  });
});
