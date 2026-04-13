import { chattingMarketingContext } from "@/lib/chatting-marketing-context";
import {
  chattingSeoProfile,
  getChattingSeoCompetitor,
  getChattingSeoTheme
} from "@/lib/chatting-seo-profile";

describe("chatting seo profile", () => {
  it("derives marketing truth from the canonical product-context doc", () => {
    expect(chattingMarketingContext.positioning[0]).toContain("Chatting is live chat built for small teams");
    expect(chattingMarketingContext.coreStory).toContain("talk to high-intent visitors before they bounce");
    expect(chattingMarketingContext.bestFit[0]).toContain("want to talk to high-intent visitors");
    expect(chattingMarketingContext.competitiveFraming.map((entry) => entry.slug)).toContain("intercom");
  });

  it("builds the seo profile from existing shipped seo and content sources", () => {
    expect(chattingSeoProfile.seo.siteTitle).toBe("Live Chat Software for Small Teams | Chatting");
    expect(chattingSeoProfile.contentInventory.blogCategories.length).toBeGreaterThan(0);
    expect(chattingSeoProfile.contentInventory.guides.length).toBeGreaterThan(0);
    expect(chattingSeoProfile.contentInventory.freeTools.length).toBeGreaterThan(0);
    expect(getChattingSeoCompetitor("intercom")?.name).toBe("Intercom");
    expect(getChattingSeoTheme("comparisons")?.label).toBe("Comparisons");
  });
});
