import {
  DEFAULT_LIVE_CHAT_ROI_INPUTS,
  calculateLiveChatRoi
} from "@/lib/live-chat-roi";

describe("live chat roi", () => {
  it("matches the calculator example numbers", () => {
    const result = calculateLiveChatRoi(DEFAULT_LIVE_CHAT_ROI_INPUTS);

    expect(result.currentConversions).toBe(250);
    expect(result.currentRevenue).toBe(21250);
    expect(result.newConversionRate).toBe(3);
    expect(result.newConversions).toBe(300);
    expect(result.newRevenue).toBe(25500);
    expect(result.monthlyRevenueLift).toBe(4250);
    expect(result.annualRevenueLift).toBe(51000);
    expect(Math.round(result.roiPercent)).toBe(14655);
    expect(result.paybackDays).toBeLessThan(1);
  });
});
