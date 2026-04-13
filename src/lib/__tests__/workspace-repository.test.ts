const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  acceptTeamInviteRecord,
  countActiveTeamMembershipRows,
  findTeamInviteAccessRow,
  findWorkspaceAccessRow,
  hasOwnedWorkspaceRecord,
  listActiveTeamMemberRows,
  listWorkspaceAccessRows,
  upsertActiveTeamMembership
} from "@/lib/repositories/workspace-repository";
import {
  conversationAccessClause,
  workspaceAccessClause
} from "@/lib/repositories/workspace-access-repository";

describe("workspace repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the workspace access clause for owners and active team members", () => {
    expect(workspaceAccessClause("s.user_id", "$2", "$3")).toContain("s.user_id = $2");
    expect(workspaceAccessClause("s.user_id", "$2", "$3")).toContain("FROM team_memberships tm");
    expect(workspaceAccessClause("s.user_id", "$2", "$3")).toContain("tm.status = 'active'");
    expect(conversationAccessClause("s.user_id", "c.assigned_user_id", "$2", "$3")).toContain(
      "c.assigned_user_id = $3"
    );
    expect(conversationAccessClause("s.user_id", "c.assigned_user_id", "$2", "$3")).toContain(
      "tm.role = 'admin'"
    );
  });

  it("returns workspace and invite access rows with null fallbacks", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            owner_user_id: "owner_1",
            role: "admin",
            owner_email: "owner@example.com",
            owner_created_at: "2026-03-29T10:00:00.000Z",
            team_name: "Chatting",
            team_domain: "usechatting.com"
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            owner_user_id: "owner_1",
            role: "owner",
            owner_email: "owner@example.com",
            owner_created_at: "2026-03-29T10:00:00.000Z",
            team_name: "Chatting",
            team_domain: "usechatting.com"
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "invite_1",
            owner_user_id: "owner_1",
            email: "alex@example.com",
            role: "member",
            status: "pending",
            message: "Join us",
            created_at: "2026-03-29T10:00:00.000Z",
            updated_at: "2026-03-29T10:00:00.000Z",
            accepted_at: null,
            accepted_by_user_id: null,
            team_name: "Chatting",
            team_domain: "usechatting.com",
            owner_email: "owner@example.com",
            owner_first_name: "Tina",
            owner_last_name: "Bauer"
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(findWorkspaceAccessRow("user_1")).resolves.toMatchObject({
      owner_user_id: "owner_1",
      role: "admin"
    });
    await expect(findWorkspaceAccessRow("user_2")).resolves.toBeNull();
    await expect(listWorkspaceAccessRows("user_1")).resolves.toHaveLength(1);
    await expect(findTeamInviteAccessRow("invite_1")).resolves.toMatchObject({
      id: "invite_1",
      owner_email: "owner@example.com"
    });
    await expect(findTeamInviteAccessRow("invite_2")).resolves.toBeNull();

    expect(mocks.query.mock.calls[0]?.[0]).toContain("WITH workspace_access AS");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("LEFT JOIN LATERAL");
  });

  it("lists and counts active memberships and owned workspace presence", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: "member_1",
            email: "alex@example.com",
            first_name: "Alex",
            last_name: "Stone",
            avatar_data_url: null,
            last_seen_at: "2026-03-29T10:00:00.000Z",
            role: "member"
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [{ count: "3" }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: "site_1" }] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(listActiveTeamMemberRows("owner_1")).resolves.toHaveLength(1);
    await expect(countActiveTeamMembershipRows("owner_1")).resolves.toBe(3);
    await expect(hasOwnedWorkspaceRecord("owner_1")).resolves.toBe(true);
    await expect(hasOwnedWorkspaceRecord("owner_2")).resolves.toBe(false);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("ORDER BY u.created_at ASC");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("COUNT(*)::text AS count");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("FROM sites");
  });

  it("writes team membership acceptance and upserts active members", async () => {
    await upsertActiveTeamMembership({
      ownerUserId: "owner_1",
      memberUserId: "member_1",
      role: "admin"
    });
    await acceptTeamInviteRecord("invite_1", "member_1");

    expect(mocks.query).toHaveBeenCalledTimes(2);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("INSERT INTO team_memberships");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["owner_1", "member_1", "admin"]);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("ON CONFLICT (owner_user_id, member_user_id)");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("SET status = 'accepted'");
    expect(mocks.query.mock.calls[1]?.[1]).toEqual(["invite_1", "member_1"]);
  });
});
