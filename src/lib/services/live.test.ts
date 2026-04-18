const mocks = vi.hoisted(() => ({
  hasConversationAccess: vi.fn(),
  listAssignedConversationIdsForMember: vi.fn()
}));

vi.mock("@/lib/repositories/shared-repository", () => ({
  hasConversationAccess: mocks.hasConversationAccess,
  listAssignedConversationIdsForMember: mocks.listAssignedConversationIdsForMember
}));

import { createDashboardLiveAuthorizer } from "./live";

describe("live service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listAssignedConversationIdsForMember.mockResolvedValue([]);
  });

  it("allows owner and admin viewers without member access lookups", async () => {
    const ownerAuthorizer = await createDashboardLiveAuthorizer({
      id: "owner_1",
      workspaceOwnerId: "owner_1",
      workspaceRole: "owner"
    });
    const adminAuthorizer = await createDashboardLiveAuthorizer({
      id: "admin_1",
      workspaceOwnerId: "owner_1",
      workspaceRole: "admin"
    });

    await expect(
      ownerAuthorizer.canStreamEvent({
        type: "conversation.read",
        conversationId: "conv_1",
        updatedAt: "2026-04-17T10:00:00.000Z"
      })
    ).resolves.toBe(true);
    await expect(
      adminAuthorizer.canStreamEvent({
        type: "message.created",
        conversationId: "conv_1",
        sender: "team",
        createdAt: "2026-04-17T10:00:00.000Z"
      })
    ).resolves.toBe(true);

    expect(mocks.listAssignedConversationIdsForMember).not.toHaveBeenCalled();
    expect(mocks.hasConversationAccess).not.toHaveBeenCalled();
  });

  it("preloads assigned member conversations and skips fallback checks for them", async () => {
    mocks.listAssignedConversationIdsForMember.mockResolvedValueOnce(["conv_1"]);
    const authorizer = await createDashboardLiveAuthorizer({
      id: "member_1",
      workspaceOwnerId: "owner_1",
      workspaceRole: "member"
    });

    await expect(
      authorizer.canStreamEvent({
        type: "message.created",
        conversationId: "conv_1",
        sender: "team",
        createdAt: "2026-04-17T10:00:00.000Z"
      })
    ).resolves.toBe(true);

    expect(mocks.listAssignedConversationIdsForMember).toHaveBeenCalledWith("owner_1", "member_1");
    expect(mocks.hasConversationAccess).not.toHaveBeenCalled();
  });

  it("updates member access from assignment hints without extra lookups", async () => {
    const authorizer = await createDashboardLiveAuthorizer({
      id: "member_1",
      workspaceOwnerId: "owner_1",
      workspaceRole: "member"
    });

    await expect(
      authorizer.canStreamEvent({
        type: "conversation.updated",
        conversationId: "conv_2",
        status: "open",
        updatedAt: "2026-04-17T10:00:00.000Z",
        assignedUserId: "member_1"
      })
    ).resolves.toBe(true);
    await expect(
      authorizer.canStreamEvent({
        type: "message.created",
        conversationId: "conv_2",
        sender: "team",
        createdAt: "2026-04-17T10:00:01.000Z"
      })
    ).resolves.toBe(true);
    await expect(
      authorizer.canStreamEvent({
        type: "conversation.updated",
        conversationId: "conv_2",
        status: "open",
        updatedAt: "2026-04-17T10:00:02.000Z",
        assignedUserId: "member_2"
      })
    ).resolves.toBe(false);

    expect(mocks.hasConversationAccess).not.toHaveBeenCalled();
  });

  it("caches fallback access checks for unknown member conversations", async () => {
    mocks.hasConversationAccess.mockResolvedValueOnce(false);
    const authorizer = await createDashboardLiveAuthorizer({
      id: "member_1",
      workspaceOwnerId: "owner_1",
      workspaceRole: "member"
    });
    const event = {
      type: "message.created" as const,
      conversationId: "conv_3",
      sender: "team" as const,
      createdAt: "2026-04-17T10:00:00.000Z"
    };

    await expect(authorizer.canStreamEvent(event)).resolves.toBe(false);
    await expect(authorizer.canStreamEvent(event)).resolves.toBe(false);

    expect(mocks.hasConversationAccess).toHaveBeenCalledTimes(1);
    expect(mocks.hasConversationAccess).toHaveBeenCalledWith("conv_3", "owner_1", "member_1");
  });
});
