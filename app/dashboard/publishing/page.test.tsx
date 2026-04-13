const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  requireUser: vi.fn(),
  getDashboardPublishingQueuedPosts: vi.fn(),
  ensureDashboardPublishingDraftAutopilot: vi.fn(),
  ensureDashboardPublishingSeoBootstrap: vi.fn(),
  ensureDashboardPublishingStaticDraftMirror: vi.fn(),
  getDashboardPublishingSeoSnapshot: vi.fn()
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/dashboard-publishing-posts", () => ({
  getDashboardPublishingQueuedPosts: mocks.getDashboardPublishingQueuedPosts
}));
vi.mock("@/lib/data/dashboard-publishing-drafts-bootstrap", () => ({
  ensureDashboardPublishingDraftAutopilot: mocks.ensureDashboardPublishingDraftAutopilot
}));
vi.mock("@/lib/data/dashboard-publishing-seo-bootstrap", () => ({
  ensureDashboardPublishingSeoBootstrap: mocks.ensureDashboardPublishingSeoBootstrap
}));
vi.mock("@/lib/data/dashboard-publishing-static-drafts-bootstrap", () => ({
  ensureDashboardPublishingStaticDraftMirror: mocks.ensureDashboardPublishingStaticDraftMirror
}));
vi.mock("@/lib/data/dashboard-publishing-seo", () => ({
  getDashboardPublishingSeoSnapshot: mocks.getDashboardPublishingSeoSnapshot
}));
vi.mock("../dashboard-publishing-page", () => ({
  DashboardPublishingPage: ({
    activeSection,
    queuedPosts,
    seoSnapshot
  }: {
    activeSection: string;
    queuedPosts: Array<{ slug: string }>;
    seoSnapshot: { database: { status: string } };
  }) => <div>section:{activeSection}:queued:{queuedPosts.map((post) => post.slug).join(",")}:seo:{seoSnapshot.database.status}</div>
}));

import { renderToStaticMarkup } from "react-dom/server";
import PublishingPage from "./page";

describe("dashboard publishing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mocks.requireUser.mockResolvedValue({ id: "user_123", email: "tina@usechatting.com", workspaceOwnerId: "owner_123" });
    mocks.getDashboardPublishingQueuedPosts.mockResolvedValue([{ slug: "traffic-low-conversion" }]);
    mocks.ensureDashboardPublishingDraftAutopilot.mockResolvedValue([]);
    mocks.ensureDashboardPublishingSeoBootstrap.mockResolvedValue(null);
    mocks.ensureDashboardPublishingStaticDraftMirror.mockResolvedValue([]);
    mocks.getDashboardPublishingSeoSnapshot.mockResolvedValue({ database: { status: "ready" } });
  });

  it("renders the queue for the allowed viewer", async () => {
    const html = renderToStaticMarkup(await PublishingPage());

    expect(html).toContain("section:overview:queued:traffic-low-conversion:seo:ready");
    expect(mocks.ensureDashboardPublishingSeoBootstrap).toHaveBeenCalledWith({
      ownerUserId: "owner_123",
      actorUserId: "user_123"
    });
    expect(mocks.ensureDashboardPublishingDraftAutopilot).toHaveBeenCalledWith({
      ownerUserId: "owner_123",
      actorUserId: "user_123"
    });
    expect(mocks.ensureDashboardPublishingStaticDraftMirror).toHaveBeenCalledWith({
      ownerUserId: "owner_123",
      actorUserId: "user_123"
    });
    expect(mocks.getDashboardPublishingSeoSnapshot).toHaveBeenCalledWith("owner_123", { includeAnalysis: true });
  });

  it("passes the requested publishing section through to the page", async () => {
    const html = renderToStaticMarkup(await PublishingPage({ searchParams: Promise.resolve({ section: "queue" }) }));

    expect(html).toContain("section:queue:queued:traffic-low-conversion:seo:ready");
    expect(mocks.getDashboardPublishingSeoSnapshot).toHaveBeenCalledWith("owner_123", { includeAnalysis: false });
  });

  it("blocks other signed-in users", async () => {
    mocks.requireUser.mockResolvedValueOnce({ id: "user_123", email: "alex@example.com", workspaceOwnerId: "owner_123" });

    await expect(PublishingPage()).rejects.toThrow("NOT_FOUND");
  });
});
