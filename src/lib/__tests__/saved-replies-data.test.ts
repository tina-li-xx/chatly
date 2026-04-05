const mocks = vi.hoisted(() => ({
  randomUUID: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  deleteSavedReplyRow: vi.fn(),
  insertSavedReplyRow: vi.fn(),
  listSavedReplyRows: vi.fn(),
  updateSavedReplyRow: vi.fn()
}));

vi.mock("node:crypto", () => ({
  randomUUID: mocks.randomUUID
}));

vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));

vi.mock("@/lib/repositories/saved-replies-repository", () => ({
  deleteSavedReplyRow: mocks.deleteSavedReplyRow,
  insertSavedReplyRow: mocks.insertSavedReplyRow,
  listSavedReplyRows: mocks.listSavedReplyRows,
  updateSavedReplyRow: mocks.updateSavedReplyRow
}));

import {
  createSavedReply,
  deleteSavedReply,
  listSavedReplies,
  updateSavedReply
} from "@/lib/data/saved-replies";

describe("saved replies data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.randomUUID.mockReturnValue("uuid_1");
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
  });

  it("lists and maps saved replies for the workspace owner", async () => {
    mocks.listSavedReplyRows.mockResolvedValueOnce([
      { id: "reply_1", title: "Pricing", body: "Hello", tags: ["pricing"], updated_at: "2026-04-02T12:00:00.000Z" }
    ]);

    await expect(listSavedReplies("user_1")).resolves.toEqual([
      { id: "reply_1", title: "Pricing", body: "Hello", tags: ["pricing"], updatedAt: "2026-04-02T12:00:00.000Z" }
    ]);
  });

  it("creates replies with trimmed input, tags, and owner scoping", async () => {
    mocks.insertSavedReplyRow.mockResolvedValueOnce({
      id: "reply_uuid_1",
      title: "Pricing",
      body: "Hello there",
      tags: ["Pricing", "sales"],
      updated_at: "2026-04-02T12:00:00.000Z"
    });

    await expect(
      createSavedReply("user_1", {
        title: "  Pricing  ",
        body: "  Hello there  ",
        tags: [" Pricing ", "sales", "pricing", "", "pricing"]
      })
    ).resolves.toEqual({
      id: "reply_uuid_1",
      title: "Pricing",
      body: "Hello there",
      tags: ["Pricing", "sales"],
      updatedAt: "2026-04-02T12:00:00.000Z"
    });

    expect(mocks.insertSavedReplyRow).toHaveBeenCalledWith({
      id: "reply_uuid_1",
      ownerUserId: "owner_1",
      title: "Pricing",
      body: "Hello there",
      tags: ["Pricing", "sales"]
    });
  });

  it("updates replies and rejects missing or missing-target records", async () => {
    mocks.updateSavedReplyRow.mockResolvedValueOnce({
      id: "reply_1",
      title: "Pricing",
      body: "Updated",
      tags: ["follow-up"],
      updated_at: "2026-04-02T12:05:00.000Z"
    });

    await expect(
      updateSavedReply("user_1", {
        id: "reply_1",
        title: " Pricing ",
        body: " Updated ",
        tags: [" follow-up "]
      })
    ).resolves.toEqual({
      id: "reply_1",
      title: "Pricing",
      body: "Updated",
      tags: ["follow-up"],
      updatedAt: "2026-04-02T12:05:00.000Z"
    });

    expect(mocks.updateSavedReplyRow).toHaveBeenCalledWith({
      id: "reply_1",
      ownerUserId: "owner_1",
      title: "Pricing",
      body: "Updated",
      tags: ["follow-up"]
    });

    await expect(
      updateSavedReply("user_1", { id: "reply_1", title: "", body: "", tags: [] })
    ).rejects.toThrow("MISSING_FIELDS");

    mocks.updateSavedReplyRow.mockResolvedValueOnce(null);
    await expect(
      updateSavedReply("user_1", { id: "reply_missing", title: "Pricing", body: "Hello", tags: [] })
    ).rejects.toThrow("NOT_FOUND");
  });

  it("deletes replies and surfaces missing rows", async () => {
    mocks.deleteSavedReplyRow.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    await expect(deleteSavedReply("user_1", "reply_1")).resolves.toBeUndefined();
    await expect(deleteSavedReply("user_1", "reply_missing")).rejects.toThrow("NOT_FOUND");
  });
});
