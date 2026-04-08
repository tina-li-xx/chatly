const mocks = vi.hoisted(() => ({
  deliverZapierEvent: vi.fn(),
  getDashboardContact: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  hasAccessibleSite: vi.fn(),
  identifyDashboardContact: vi.fn()
}));

vi.mock("@/lib/data/contact-access", () => ({
  hasAccessibleSite: mocks.hasAccessibleSite
}));
vi.mock("@/lib/data/contact-queries", () => ({
  getDashboardContact: mocks.getDashboardContact
}));
vi.mock("@/lib/data/contact-sync", () => ({
  identifyDashboardContact: mocks.identifyDashboardContact
}));
vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));
vi.mock("@/lib/zapier-event-delivery", () => ({
  deliverZapierEvent: mocks.deliverZapierEvent
}));
vi.mock("@/lib/contact-events", () => ({
  recordContactDeletedEvent: vi.fn(),
  recordContactDiffEvents: vi.fn()
}));
vi.mock("@/lib/data/contact-note-updates", () => ({
  resolveUpdatedContactNotes: vi.fn()
}));
vi.mock("@/lib/data/contact-records", () => ({
  saveMappedContact: vi.fn()
}));
vi.mock("@/lib/repositories/contacts-repository", () => ({
  deleteDashboardContactRow: vi.fn()
}));

import { createDashboardContact } from "@/lib/data/contact-mutations";

describe("contact mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasAccessibleSite.mockResolvedValue(true);
    mocks.identifyDashboardContact.mockResolvedValue(undefined);
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
  });

  it("delivers a zapier contact.created event only for new contacts", async () => {
    mocks.getDashboardContact
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "contact_1",
        email: "lead@example.com",
        name: "Lead",
        company: "Acme",
        firstSeenAt: "2026-04-07T12:00:00.000Z"
      });

    const contact = await createDashboardContact({
      userId: "owner_1",
      siteId: "site_1",
      email: "lead@example.com",
      source: "zapier_api"
    });

    expect(contact).toMatchObject({ id: "contact_1" });
    expect(mocks.deliverZapierEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: "owner_1",
        eventType: "contact.created"
      })
    );
  });
});
