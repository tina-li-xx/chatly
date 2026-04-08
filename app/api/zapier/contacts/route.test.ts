const mocks = vi.hoisted(() => ({
  createDashboardContact: vi.fn(),
  getZapierPrimarySite: vi.fn(),
  listZapierContacts: vi.fn(),
  requireZapierApiAuth: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createDashboardContact: mocks.createDashboardContact
}));
vi.mock("@/lib/zapier-api-auth", () => ({
  requireZapierApiAuth: mocks.requireZapierApiAuth
}));
vi.mock("@/lib/zapier-api-resources", () => ({
  getZapierPrimarySite: mocks.getZapierPrimarySite,
  listZapierContacts: mocks.listZapierContacts
}));

import { GET, POST } from "./route";

describe("zapier contacts route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireZapierApiAuth.mockResolvedValue({
      auth: { ownerUserId: "owner_1" }
    });
  });

  it("lists contacts for Zapier samples", async () => {
    mocks.listZapierContacts.mockResolvedValueOnce([
      {
        id: "contact_1",
        email: "visitor@example.com",
        name: "Tina Martinez",
        company: "Acme Corp",
        first_seen_at: "2026-04-08T01:30:00.000Z"
      }
    ]);

    const response = await GET(
      new Request("https://chatting.test/api/zapier/contacts?limit=1")
    );

    expect(mocks.listZapierContacts).toHaveBeenCalledWith("owner_1", 1);
    expect(await response.json()).toEqual([
      {
        event: "contact.created",
        timestamp: "2026-04-08T01:30:00.000Z",
        data__contact_id: "contact_1",
        data__email: "visitor@example.com",
        data__name: "Tina Martinez",
        data__company: "Acme Corp",
        data__source: "chat_form",
        data: {
          contact_id: "contact_1",
          email: "visitor@example.com",
          name: "Tina Martinez",
          company: "Acme Corp",
          source: "chat_form"
        }
      }
    ]);
  });

  it("creates contacts against the primary workspace site", async () => {
    mocks.getZapierPrimarySite.mockResolvedValueOnce({ id: "site_1" });
    mocks.createDashboardContact.mockResolvedValueOnce({
      id: "contact_1",
      email: "lead@example.com",
      name: "Lead",
      firstSeenAt: "2026-04-07T12:00:00.000Z"
    });

    const response = await POST(
      new Request("https://chatting.test/api/zapier/contacts", {
        method: "POST",
        body: JSON.stringify({
          email: "lead@example.com",
          name: "Lead",
          tags: ["zapier-import"]
        })
      })
    );

    expect(mocks.createDashboardContact).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner_1",
        siteId: "site_1",
        source: "zapier_api"
      })
    );
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      ok: true,
      id: "contact_1",
      email: "lead@example.com",
      name: "Lead",
      created_at: "2026-04-07T12:00:00.000Z"
    });
  });
});
