import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  createSiteForUser: vi.fn(),
  getCurrentUser: vi.fn(),
  getOnboardingData: vi.fn(),
  redirect: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect
}));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser
}));
vi.mock("@/lib/data", () => ({
  createSiteForUser: mocks.createSiteForUser,
  getOnboardingData: mocks.getOnboardingData
}));

describe("onboarding page and entry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("redirects anonymous users from the onboarding page", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce(null);
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(url);
    });

    const OnboardingPage = (await import("./page")).default;

    await expect(OnboardingPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("/signup");
  });

  it("creates a default site and passes the guarded initial step into the flow", async () => {
    const captures: Record<string, unknown> = {};
    mocks.getCurrentUser.mockResolvedValue({ id: "user_1" });
    mocks.getOnboardingData.mockResolvedValueOnce({ step: "customize", site: null });
    mocks.createSiteForUser.mockResolvedValueOnce({ id: "site_1", name: "My site" });
    vi.doMock("./onboarding-flow", () => ({
      OnboardingFlow: (props: unknown) => ((captures.flow = props), <div>flow</div>)
    }));

    const { OnboardingEntry } = await import("./onboarding-entry");
    expect(renderToStaticMarkup(await OnboardingEntry({ requestedStep: "install" }))).toContain("flow");

    expect(mocks.createSiteForUser).toHaveBeenCalledWith("user_1", { name: "My site" });
    expect(captures.flow).toEqual({
      initialStep: "customize",
      initialSite: { id: "site_1", name: "My site" }
    });
  });

  it("redirects completed onboarding back to the dashboard unless explicitly requesting done", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce({ id: "user_1" });
    mocks.getOnboardingData.mockResolvedValueOnce({ step: "done", site: { id: "site_1" } });
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(url);
    });

    const { OnboardingEntry } = await import("./onboarding-entry");

    await expect(OnboardingEntry({ requestedStep: "install" })).rejects.toThrow("/dashboard");
  });
});
