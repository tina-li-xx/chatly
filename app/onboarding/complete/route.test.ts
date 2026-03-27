const mocks = vi.hoisted(() => ({
  setUserOnboardingStep: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  setUserOnboardingStep: mocks.setUserOnboardingStep
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("onboarding complete route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatly.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("rejects invalid onboarding steps", async () => {
    const response = await POST(
      new Request("http://localhost/onboarding/complete", {
        method: "POST",
        body: JSON.stringify({ step: "signup" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "invalid-step" });
  });

  it("persists the next onboarding step", async () => {
    mocks.setUserOnboardingStep.mockResolvedValueOnce({
      onboarding_step: "done",
      onboarding_completed_at: "2026-03-27T00:00:00.000Z"
    });

    const response = await POST(
      new Request("http://localhost/onboarding/complete", {
        method: "POST",
        body: JSON.stringify({ step: "done" })
      })
    );

    expect(mocks.setUserOnboardingStep).toHaveBeenCalledWith("user_123", "done");
    expect(await response.json()).toEqual({
      ok: true,
      step: "done",
      completedAt: "2026-03-27T00:00:00.000Z"
    });
  });
});
