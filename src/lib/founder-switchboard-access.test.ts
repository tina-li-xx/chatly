import {
  FOUNDER_SWITCHBOARD_EMAIL,
  FOUNDER_SWITCHBOARD_ROUTE,
  canAccessFounderSwitchboard
} from "./founder-switchboard-access";

describe("founder switchboard access", () => {
  it("exposes a non-admin route slug and founder gate", () => {
    expect(FOUNDER_SWITCHBOARD_ROUTE).toBe("/dashboard/switchboard");
    expect(FOUNDER_SWITCHBOARD_ROUTE).not.toContain("admin");
    expect(FOUNDER_SWITCHBOARD_EMAIL).toBe("tina@usechatting.com");
  });

  it("only allows the founder email", () => {
    expect(canAccessFounderSwitchboard("tina@usechatting.com")).toBe(true);
    expect(canAccessFounderSwitchboard(" Tina@UseChatting.com ")).toBe(true);
    expect(canAccessFounderSwitchboard("alex@example.com")).toBe(false);
  });
});
