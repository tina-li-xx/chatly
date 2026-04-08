const mocks = vi.hoisted(() => ({
  getDashboardContactConversations: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getDashboardContactConversations: mocks.getDashboardContactConversations
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("contact conversations route", () => {
  it("returns the auth response when the request is not authorized", async () => {
    const response = Response.json({ ok: false }, { status: 401 });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ response });

    await expect(GET(new Request("https://chatting.test/api/contacts/contact_1/conversations"), {
      params: Promise.resolve({ id: "contact_1" })
    })).resolves.toBe(response);
  });

  it("returns only the contact conversation history", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ user: { id: "user_1" } });
    mocks.getDashboardContactConversations.mockResolvedValueOnce([
      {
        id: "conv_1",
        title: "Question about enterprise pricing",
        status: "open",
        createdAt: "2026-04-05T10:00:00.000Z",
        assignedUserId: null,
        messageCount: 4
      }
    ]);

    const response = await GET(new Request("https://chatting.test/api/contacts/contact_1/conversations"), {
      params: Promise.resolve({ id: "contact_1" })
    });

    expect(mocks.getDashboardContactConversations).toHaveBeenCalledWith("user_1", "contact_1");
    expect(await response.json()).toEqual({
      ok: true,
      conversations: [
        {
          id: "conv_1",
          title: "Question about enterprise pricing",
          status: "open",
          createdAt: "2026-04-05T10:00:00.000Z",
          assignedUserId: null,
          messageCount: 4
        }
      ]
    });
  });
});
