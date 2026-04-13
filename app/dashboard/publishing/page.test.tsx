const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
  requireUser: vi.fn()
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound, redirect: mocks.redirect }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));

import PublishingPage from "./page";

describe("dashboard publishing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    mocks.requireUser.mockResolvedValue({ id: "user_123", email: "tina@usechatting.com", workspaceOwnerId: "owner_123" });
  });

  it("redirects the allowed viewer into switchboard publishing", async () => {
    await expect(PublishingPage()).rejects.toThrow("REDIRECT:/dashboard/switchboard?section=publishing-overview");
  });

  it("preserves the requested publishing subsection in the redirect", async () => {
    await expect(PublishingPage({ searchParams: Promise.resolve({ section: "queue" }) })).rejects.toThrow(
      "REDIRECT:/dashboard/switchboard?section=publishing-queue"
    );
  });

  it("blocks other signed-in users", async () => {
    mocks.requireUser.mockResolvedValueOnce({ id: "user_123", email: "alex@example.com", workspaceOwnerId: "owner_123" });

    await expect(PublishingPage()).rejects.toThrow("NOT_FOUND");
  });
});
