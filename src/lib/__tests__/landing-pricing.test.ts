import {
  clampLandingTeamSize,
  getLandingGrowthDisplayPrice,
  getLandingGrowthPriceNote,
  getLandingStarterDisplayPrice
} from "@/lib/landing-pricing";

describe("landing pricing", () => {
  it("uses the shared free starter pricing", () => {
    expect(getLandingStarterDisplayPrice("monthly")).toEqual({
      amount: "$0",
      cadence: "/month",
      note: null
    });
  });

  it("uses slider-aware growth preview pricing", () => {
    expect(getLandingGrowthDisplayPrice("monthly", 1)).toEqual({
      amount: "$20",
      cadence: "/month",
      note: null
    });

    expect(getLandingGrowthDisplayPrice("monthly", 31)).toEqual({
      amount: "$124",
      cadence: "/month",
      note: null
    });

    expect(getLandingGrowthDisplayPrice("annual", 1)).toEqual({
      amount: "$200",
      cadence: "/year",
      note: null
    });

    expect(getLandingGrowthDisplayPrice("monthly", 50)).toEqual({
      amount: "Custom",
      cadence: "",
      note: "50+ members"
    });

    expect(getLandingGrowthPriceNote("monthly")).toBe(
      "1-3 members, then volume pricing from $6/member/month"
    );
    expect(getLandingGrowthPriceNote("annual")).toBe(
      "1-3 members, then volume pricing from $60/member/year"
    );
  });

  it("clamps landing team sizes into the supported range", () => {
    expect(clampLandingTeamSize(0)).toBe(1);
    expect(clampLandingTeamSize(71)).toBe(50);
  });
});
