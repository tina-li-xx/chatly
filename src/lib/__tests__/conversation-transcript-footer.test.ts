import {
  buildConversationTranscriptFooterContent,
  shouldShowTranscriptViralFooter
} from "@/lib/conversation-transcript-footer";

describe("conversation transcript footer helpers", () => {
  it("builds tracked viral footer content for branded plans", () => {
    const footer = buildConversationTranscriptFooterContent({
      appUrl: "https://chatting.example",
      teamName: "Acme Support",
      showViralFooter: true
    });

    expect(footer.viral?.hookText).toBe("\u{1F4AC} Enjoying fast, friendly support?");
    expect(footer.viral?.ctaLabel).toBe("Try Chatting Free \u2192");
    expect(footer.viral?.text).toContain(
      "https://chatting.example/?utm_source=transcript_email&utm_medium=email&utm_campaign=viral_footer&utm_content=variant_a&ref=acme-support"
    );
    expect(footer.legal?.text).toContain("This email was sent by Acme Support using Chatting.");
    expect(footer.legal?.text).toContain("Privacy Policy: https://chatting.example/privacy");
  });

  it("omits the branded footer for paid accounts without Chatting branding", () => {
    expect(buildConversationTranscriptFooterContent({
      appUrl: "https://chatting.example",
      teamName: "Acme Support",
      showViralFooter: false
    })).toEqual({
      viral: null,
      legal: null
    });
  });

  it("maps starter plans to branded transcripts and paid plans to unbranded ones", () => {
    expect(shouldShowTranscriptViralFooter("starter")).toBe(true);
    expect(shouldShowTranscriptViralFooter(null)).toBe(true);
    expect(shouldShowTranscriptViralFooter("growth")).toBe(false);
  });
});
