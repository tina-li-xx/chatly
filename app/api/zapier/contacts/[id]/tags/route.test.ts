const mocks = vi.hoisted(() => ({
  getDashboardContact: vi.fn(),
  requireZapierApiAuth: vi.fn(),
  updateDashboardContact: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getDashboardContact: mocks.getDashboardContact,
  updateDashboardContact: mocks.updateDashboardContact
}));
vi.mock("@/lib/zapier-api-auth", () => ({
  requireZapierApiAuth: mocks.requireZapierApiAuth
}));

import { POST } from "./route";

describe("zapier contact tags route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireZapierApiAuth.mockResolvedValue({
      auth: { ownerUserId: "owner_1" }
    });
  });

  it("adds a tag to the contact", async () => {
    mocks.getDashboardContact.mockResolvedValueOnce({
      id: "contact_1",
      tags: ["vip"]
    });
    mocks.updateDashboardContact.mockResolvedValueOnce({ id: "contact_1" });

    const response = await POST(
      new Request("https://chatting.test/api/zapier/contacts/contact_1/tags", {
        method: "POST",
        body: JSON.stringify({ tag: "priority" })
      }),
      { params: Promise.resolve({ id: "contact_1" }) }
    );

    expect(mocks.updateDashboardContact).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner_1",
        contactId: "contact_1",
        tags: ["vip", "priority"]
      })
    );
    expect(await response.json()).toEqual({
      ok: true,
      id: "contact_1",
      tag: "priority"
    });
  });
});
