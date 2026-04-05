const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  getCurrentUser: vi.fn(),
  getTeamInvitePreview: vi.fn(),
  acceptTeamInvite: vi.fn(),
  switchCurrentWorkspace: vi.fn()
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/workspace-access", () => ({
  acceptTeamInvite: mocks.acceptTeamInvite,
  getTeamInvitePreview: mocks.getTeamInvitePreview,
  switchCurrentWorkspace: mocks.switchCurrentWorkspace
}));
vi.mock("../login/auth-shell", () => ({
  AuthPageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AuthFormIntro: ({ title, caption }: { title: string; caption: string }) => <div>{title} {caption}</div>
}));

import { renderToStaticMarkup } from "react-dom/server";
import InvitePage from "./page";

function pendingInvite(overrides: Record<string, unknown> = {}) {
  return {
    id: "invite_1",
    ownerUserId: "owner_1",
    email: "alex@example.com",
    role: "admin" as const,
    message: "Come join us",
    teamName: "Growth",
    teamDomain: "usechatting.com",
    inviterName: "Tina",
    state: "pending" as const,
    ...overrides
  };
}

describe("invite page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
    mocks.getCurrentUser.mockResolvedValue(null);
    mocks.getTeamInvitePreview.mockResolvedValue(pendingInvite());
    mocks.acceptTeamInvite.mockResolvedValue({ ownerUserId: "owner_1", alreadyAccepted: false });
  });

  it("renders pending invites with account links", async () => {
    const html = renderToStaticMarkup(await InvitePage({
      searchParams: Promise.resolve({ invite: "invite_1", email: "alex@example.com" })
    }));

    expect(html).toContain("Choose how you&#x27;d like to continue.");
    expect(html).toContain("/signup?invite=invite_1&amp;email=alex%40example.com");
    expect(html).toContain("/login?invite=invite_1&amp;email=alex%40example.com");
  });

  it("redirects after auto-accepting a matching pending invite", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user_1", email: "alex@example.com" });

    await InvitePage({ searchParams: Promise.resolve({ invite: "invite_1" }) });

    expect(mocks.acceptTeamInvite).toHaveBeenCalledWith({
      inviteId: "invite_1",
      userId: "user_1",
      email: "alex@example.com"
    });
    expect(mocks.switchCurrentWorkspace).toHaveBeenCalledWith({
      userId: "user_1",
      ownerUserId: "owner_1"
    });
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("shows automatic acceptance failures and signed-in email mismatches", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user_1", email: "alex@example.com" });
    mocks.acceptTeamInvite.mockRejectedValueOnce(new Error("boom"));
    const html = renderToStaticMarkup(await InvitePage({
      searchParams: Promise.resolve({ invite: "invite_1" })
    }));

    expect(html).toContain("We couldn&#x27;t accept this invite automatically.");

    mocks.getCurrentUser.mockResolvedValueOnce({ id: "user_1", email: "owner@example.com" });
    const mismatchHtml = renderToStaticMarkup(await InvitePage({
      searchParams: Promise.resolve({ invite: "invite_1" })
    }));
    expect(mismatchHtml).toContain("You&#x27;re signed in as owner@example.com, but this invite is for alex@example.com.");
  });

  it("redirects accepted invites for the same user and renders missing invites", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user_1", email: "alex@example.com" });
    mocks.getTeamInvitePreview.mockResolvedValueOnce(pendingInvite({ state: "accepted" }));
    await expect(
      InvitePage({ searchParams: Promise.resolve({ invite: "invite_1" }) })
    ).rejects.toThrow("REDIRECT:/dashboard");
    expect(mocks.switchCurrentWorkspace).toHaveBeenCalledWith({
      userId: "user_1",
      ownerUserId: "owner_1"
    });

    mocks.getCurrentUser.mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await InvitePage({
      searchParams: Promise.resolve({})
    }));
    expect(html).toContain("We couldn&#x27;t find that invite.");
    expect(html).toContain("Back to sign in");
  });
});
