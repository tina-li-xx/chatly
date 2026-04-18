import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

async function flushAsyncWork() {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
  }
}

describe("useDashboardHomeTeamStatus", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("patches teammate presence locally and refetches on reconnect and roster updates", async () => {
    vi.resetModules();
    const reactMocks = createMockReactHooks();
    vi.doMock("react", () => reactMocks.moduleFactory());

    let liveListener: {
      onOpen?: () => void;
      onMessage?: (event: { type: string; userId?: string; updatedAt?: string }) => void;
    } | null = null;
    vi.doMock("./dashboard-live-client", () => ({
      subscribeDashboardLiveClient: (listener: typeof liveListener) => {
        liveListener = listener;
        return () => {};
      }
    }));

    vi.stubGlobal("window", {
      setInterval: vi.fn().mockReturnValue(1),
      clearInterval: vi.fn()
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        ok: true,
        teamMembers: [
          {
            id: "member_1",
            name: "Tina",
            email: "tina@example.com",
            initials: "T",
            role: "owner",
            status: "online",
            lastActiveLabel: "Just now",
            lastSeenAt: "2026-04-18T00:05:00.000Z",
            isCurrentUser: true,
            avatarDataUrl: null
          }
        ],
        pendingInviteCount: 2
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const module = await import("./use-dashboard-home-team-status");

    reactMocks.beginRender();
    module.useDashboardHomeTeamStatus({
      teamMembers: [
        {
          id: "member_1",
          name: "Tina",
          email: "tina@example.com",
          initials: "T",
          role: "owner",
          status: "offline",
          lastActiveLabel: "2h ago",
          lastSeenAt: "2026-04-17T22:05:00.000Z",
          isCurrentUser: true,
          avatarDataUrl: null
        }
      ],
      pendingInviteCount: 1
    });
    await runMockEffects(reactMocks.effects);

    liveListener?.onMessage?.({
      type: "team.presence.updated",
      userId: "member_1",
      updatedAt: "2026-04-18T00:04:30.000Z"
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect((reactMocks.states[0]?.current as { teamMembers: Array<{ lastSeenAt: string }> }).teamMembers[0]?.lastSeenAt).toBe(
      "2026-04-18T00:04:30.000Z"
    );

    liveListener?.onOpen?.();
    await flushAsyncWork();

    expect(fetchMock).not.toHaveBeenCalled();

    liveListener?.onOpen?.();
    await flushAsyncWork();

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/dashboard/team-status", {
      method: "GET",
      cache: "no-store"
    });
    expect((reactMocks.states[0]?.current as { pendingInviteCount: number }).pendingInviteCount).toBe(2);

    liveListener?.onMessage?.({
      type: "team.members.updated",
      updatedAt: "2026-04-18T00:05:00.000Z"
    });
    await flushAsyncWork();

    expect(fetchMock).toHaveBeenNthCalledWith(2, "/dashboard/team-status", {
      method: "GET",
      cache: "no-store"
    });
    expect((reactMocks.states[0]?.current as { pendingInviteCount: number }).pendingInviteCount).toBe(2);
  });
});
