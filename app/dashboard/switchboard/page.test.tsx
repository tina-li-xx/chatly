const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  requireUser: vi.fn(),
  getFounderSwitchboardData: vi.fn(),
  getDashboardPublishingQueuedPosts: vi.fn(),
  ensureDashboardPublishingDraftAutopilot: vi.fn(),
  ensureDashboardPublishingSeoBootstrap: vi.fn(),
  ensureDashboardPublishingStaticDraftMirror: vi.fn(),
  getDashboardPublishingSeoSnapshot: vi.fn()
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/data/founder-switchboard", () => ({
  getFounderSwitchboardData: mocks.getFounderSwitchboardData
}));
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
vi.mock("../dashboard-switchboard-page", () => ({
  DashboardSwitchboardPage: ({
    data,
    publishingData,
    activeSection,
    activeCustomerFilter
  }: {
    data: { summary: { totalWorkspaces: number } } | null;
    publishingData?: { queuedPosts: Array<{ slug: string }>; seoSnapshot: { database: { status: string } } } | null;
    activeSection: string;
    activeCustomerFilter: string;
  }) => (
    <div>
      switchboard:{data?.summary.totalWorkspaces ?? 0}:section:{activeSection}:customerFilter:{activeCustomerFilter}
      :queued:{publishingData?.queuedPosts.map((post) => post.slug).join(",") ?? "none"}
      :seo:{publishingData?.seoSnapshot.database.status ?? "none"}
    </div>
  )
}));

import { renderToStaticMarkup } from "react-dom/server";
import SwitchboardPage from "./page";

describe("dashboard founder switchboard route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mocks.requireUser.mockResolvedValue({
      id: "user_1",
      email: "tina@usechatting.com",
      workspaceOwnerId: "owner_1",
      workspaceRole: "owner"
    });
    mocks.getFounderSwitchboardData.mockResolvedValue({
      summary: { totalWorkspaces: 3 }
    });
    mocks.getDashboardPublishingQueuedPosts.mockResolvedValue([{ slug: "traffic-low-conversion" }]);
    mocks.ensureDashboardPublishingDraftAutopilot.mockResolvedValue([]);
    mocks.ensureDashboardPublishingSeoBootstrap.mockResolvedValue(null);
    mocks.ensureDashboardPublishingStaticDraftMirror.mockResolvedValue([]);
    mocks.getDashboardPublishingSeoSnapshot.mockResolvedValue({ database: { status: "ready" } });
  });

  it("renders the switchboard for the founder", async () => {
    const html = renderToStaticMarkup(await SwitchboardPage());

    expect(html).toContain("switchboard:3:section:overview:customerFilter:all");
  });

  it("passes the requested section and customer filter through to the page", async () => {
    const html = renderToStaticMarkup(
      await SwitchboardPage({ searchParams: Promise.resolve({ section: "customers", customerFilter: "active" }) })
    );

    expect(html).toContain("switchboard:3:section:customers:customerFilter:active");
  });

  it("loads publishing data when a switchboard publishing section is requested", async () => {
    const html = renderToStaticMarkup(
      await SwitchboardPage({ searchParams: Promise.resolve({ section: "publishing-queue" }) })
    );

    expect(html).toContain("switchboard:0:section:publishing-queue:customerFilter:all:queued:traffic-low-conversion:seo:ready");
    expect(mocks.getFounderSwitchboardData).not.toHaveBeenCalled();
    expect(mocks.getDashboardPublishingSeoSnapshot).toHaveBeenCalledWith("owner_1", { includeAnalysis: false });
  });

  it("returns not found for other users", async () => {
    mocks.requireUser.mockResolvedValueOnce({
      id: "user_2",
      email: "alex@example.com",
      workspaceOwnerId: "owner_2",
      workspaceRole: "owner"
    });

    await expect(SwitchboardPage()).rejects.toThrow("NOT_FOUND");
  });
});
