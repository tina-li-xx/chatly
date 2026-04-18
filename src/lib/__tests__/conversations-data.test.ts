const mocks = vi.hoisted(() => ({
  findNextRoundRobinAssigneeUserId: vi.fn(),
  clearConversationFaqHandoffState: vi.fn(),
  deleteConversationTag: vi.fn(),
  deleteConversationTypingRecord: vi.fn(),
  deleteVisitorTypingRecord: vi.fn(),
  ensureConversation: vi.fn(),
  findActiveConversationTyping: vi.fn(),
  findConversationById: vi.fn(),
  findConversationEmailById: vi.fn(),
  findConversationEmailStateForUser: vi.fn(),
  findConversationFaqHandoffState: vi.fn(),
  findConversationIdentityForActivity: vi.fn(),
  findConversationNotificationContextRow: vi.fn(),
  findConversationTag: vi.fn(),
  findVisitorContactRow: vi.fn(),
  findVisitorPresenceSessionRow: vi.fn(),
  updateVisitorPresenceSessionEmail: vi.fn(),
  findPublicAttachmentRecord: vi.fn(),
  findVisitorConversationEmailState: vi.fn(),
  getConversationVisitorActivity: vi.fn(),
  getPublicConversationAccess: vi.fn(),
  getSiteByPublicId: vi.fn(),
  findSitePresenceRow: vi.fn(),
  findWorkspaceAutomationSettingsValue: vi.fn(),
  hasConversationAccess: vi.fn(),
  hasPreviousVisitorConversation: vi.fn(),
  insertConversationTag: vi.fn(),
  insertMessage: vi.fn(),
  loadConversationMessages: vi.fn(),
  migrateVisitorNoteIdentity: vi.fn(),
  overlayConversationSummaryWithLivePresence: vi.fn(),
  previewIncomingMessage: vi.fn(),
  queryConversationSummaries: vi.fn(),
  recordVisitorPresence: vi.fn(),
  setConversationFaqHandoffState: vi.fn(),
  syncVisitorContact: vi.fn(),
  upsertConversationFeedback: vi.fn(),
  upsertConversationRead: vi.fn(),
  upsertConversationTypingRecord: vi.fn(),
  upsertMetadata: vi.fn(),
  upsertVisitorTypingRecord: vi.fn(),
  updateConversationEmailValue: vi.fn(),
  updateConversationStatusRecord: vi.fn(),
  updateVisitorConversationEmailRecord: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  isHighIntentPage: vi.fn(),
  listActiveTeamMemberRows: vi.fn(),
  updateConversationAssignmentRecord: vi.fn()
}));

vi.mock("@/lib/repositories/conversations-repository", () => ({
  findNextRoundRobinAssigneeUserId: mocks.findNextRoundRobinAssigneeUserId,
  clearConversationFaqHandoffState: mocks.clearConversationFaqHandoffState,
  deleteConversationTag: mocks.deleteConversationTag,
  deleteConversationTypingRecord: mocks.deleteConversationTypingRecord,
  deleteVisitorTypingRecord: mocks.deleteVisitorTypingRecord,
  findActiveConversationTyping: mocks.findActiveConversationTyping,
  findConversationById: mocks.findConversationById,
  findConversationEmailById: mocks.findConversationEmailById,
  findConversationEmailStateForUser: mocks.findConversationEmailStateForUser,
  findConversationFaqHandoffState: mocks.findConversationFaqHandoffState,
  findConversationIdentityForActivity: mocks.findConversationIdentityForActivity,
  findConversationNotificationContextRow: mocks.findConversationNotificationContextRow,
  findConversationTag: mocks.findConversationTag,
  findPublicAttachmentRecord: mocks.findPublicAttachmentRecord,
  findVisitorConversationEmailState: mocks.findVisitorConversationEmailState,
  insertConversationTag: mocks.insertConversationTag,
  setConversationFaqHandoffState: mocks.setConversationFaqHandoffState,
  updateConversationAssignmentRecord: mocks.updateConversationAssignmentRecord,
  updateConversationStatusRecord: mocks.updateConversationStatusRecord,
  updateVisitorConversationEmailRecord: mocks.updateVisitorConversationEmailRecord,
  upsertConversationFeedback: mocks.upsertConversationFeedback,
  upsertConversationRead: mocks.upsertConversationRead,
  upsertConversationTypingRecord: mocks.upsertConversationTypingRecord,
  upsertVisitorTypingRecord: mocks.upsertVisitorTypingRecord
}));
vi.mock("@/lib/repositories/workspace-repository", () => ({
  listActiveTeamMemberRows: mocks.listActiveTeamMemberRows
}));
vi.mock("@/lib/repositories/visitor-contacts-repository", () => ({
  findVisitorContactRow: mocks.findVisitorContactRow
}));
vi.mock("@/lib/repositories/visitor-presence-repository", () => ({
  findVisitorPresenceSessionRow: mocks.findVisitorPresenceSessionRow,
  updateVisitorPresenceSessionEmail: mocks.updateVisitorPresenceSessionEmail
}));
vi.mock("@/lib/notification-utils", () => ({
  isHighIntentPage: mocks.isHighIntentPage,
  previewIncomingMessage: mocks.previewIncomingMessage
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/sites", () => ({ getSiteByPublicId: mocks.getSiteByPublicId }));
vi.mock("@/lib/repositories/sites-repository", () => ({ findSitePresenceRow: mocks.findSitePresenceRow }));
vi.mock("@/lib/repositories/settings-repository", () => ({
  findWorkspaceAutomationSettingsValue: mocks.findWorkspaceAutomationSettingsValue
}));
vi.mock("@/lib/data/visitor-notes", () => ({ migrateVisitorNoteIdentity: mocks.migrateVisitorNoteIdentity }));
vi.mock("@/lib/data/visitors", () => ({
  recordVisitorPresence: mocks.recordVisitorPresence,
  syncVisitorContact: mocks.syncVisitorContact
}));
vi.mock("@/lib/data/conversations-internals", () => ({
  ensureConversation: mocks.ensureConversation,
  getConversationVisitorActivity: mocks.getConversationVisitorActivity,
  getPublicConversationAccess: mocks.getPublicConversationAccess,
  hasPreviousVisitorConversation: mocks.hasPreviousVisitorConversation,
  insertMessage: mocks.insertMessage,
  loadConversationMessages: mocks.loadConversationMessages,
  upsertMetadata: mocks.upsertMetadata
}));
vi.mock("@/lib/data/shared", () => ({
  hasConversationAccess: mocks.hasConversationAccess,
  mapAttachment: vi.fn(),
  mapMessage: vi.fn(),
  mapSummary: (row: Record<string, unknown>) => ({ id: row.id, pageUrl: row.page_url, city: row.city, region: row.region, country: row.country }),
  overlayConversationSummaryWithLivePresence: mocks.overlayConversationSummaryWithLivePresence,
  queryConversationSummaries: mocks.queryConversationSummaries,
  updateConversationEmailValue: mocks.updateConversationEmailValue
}));

import {
  createUserMessage,
  getConversationById,
  saveVisitorConversationEmail,
  updateVisitorTyping
} from "@/lib/data/conversations";

describe("conversation data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.previewIncomingMessage.mockReturnValue("Hello there");
    mocks.ensureConversation.mockResolvedValue({ conversationId: "conv_1", createdConversation: true, emailCaptured: true });
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.overlayConversationSummaryWithLivePresence.mockImplementation(async (summary: unknown) => summary);
    mocks.getSiteByPublicId.mockResolvedValue({
      id: "site_1",
      userId: "owner_1",
      name: "Main site",
      requireEmailOffline: true,
      responseTimeMode: "hours",
      operatingHoursEnabled: false,
      operatingHoursTimezone: "UTC",
      operatingHours: {
        monday: { enabled: true, from: "09:00", to: "17:00" },
        tuesday: { enabled: true, from: "09:00", to: "17:00" },
        wednesday: { enabled: true, from: "09:00", to: "17:00" },
        thursday: { enabled: true, from: "09:00", to: "17:00" },
        friday: { enabled: true, from: "09:00", to: "17:00" },
        saturday: { enabled: false, from: "10:00", to: "16:00" },
        sunday: { enabled: false, from: "10:00", to: "16:00" }
      }
    });
    mocks.findSitePresenceRow.mockResolvedValue({ last_seen_at: null });
    mocks.findWorkspaceAutomationSettingsValue.mockResolvedValue("");
    mocks.findNextRoundRobinAssigneeUserId.mockResolvedValue("owner_1");
    mocks.findConversationById.mockResolvedValue({ site_id: "site_1", email: null, session_id: "session_1" });
    mocks.findConversationFaqHandoffState.mockResolvedValue(null);
    mocks.findConversationNotificationContextRow.mockResolvedValue({
      user_id: "owner_1",
      owner_user_id: "owner_1",
      site_name: "Main site"
    });
    mocks.findVisitorContactRow.mockResolvedValue(null);
    mocks.findVisitorPresenceSessionRow.mockResolvedValue(null);
    mocks.hasPreviousVisitorConversation.mockResolvedValue(false);
    mocks.insertMessage.mockResolvedValue({ id: "msg_1", createdAt: "2026-03-29T10:00:00.000Z" });
    mocks.listActiveTeamMemberRows.mockResolvedValue([{ user_id: "member_1" }]);
    mocks.queryConversationSummaries.mockResolvedValue({ rowCount: 1, rows: [{ id: "conv_1", page_url: "https://example.com/pricing", city: "London", region: "England", country: "UK" }] });
    mocks.isHighIntentPage.mockReturnValue(true);
    mocks.getConversationVisitorActivity.mockResolvedValue({ matchType: "email" });
    mocks.loadConversationMessages.mockResolvedValue([{ id: "msg_1" }]);
  });

  it("creates user messages and returns the derived notification payload", async () => {
    const result = await createUserMessage({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com",
      content: "Hello there",
      attachments: [],
      metadata: { pageUrl: "https://example.com/pricing" }
    } as never);

    expect(mocks.recordVisitorPresence).toHaveBeenCalledWith(expect.objectContaining({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" }));
    expect(result).toMatchObject({
      conversationId: "conv_1",
      siteUserId: "owner_1",
      siteName: "Main site",
      preview: "Hello there",
      location: "London, England, UK",
      visitorLabel: "alex@example.com",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true,
      welcomeEmailEligible: true
    });
    expect(result.notification).toMatchObject({
      userId: "owner_1",
      conversationId: "conv_1",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true
    });
  });

  it("creates an automated away reply when the first message arrives while the team is offline", async () => {
    mocks.findWorkspaceAutomationSettingsValue.mockResolvedValue(
      JSON.stringify({
        offline: {
          autoReplyEnabled: true,
          autoReplyMessage: "Thanks for reaching out. We'll reply shortly.",
          autoReplyWhen: "team_offline"
        }
      })
    );
    mocks.insertMessage
      .mockResolvedValueOnce({ id: "msg_1", createdAt: "2026-03-29T10:00:00.000Z" })
      .mockResolvedValueOnce({ id: "msg_2", createdAt: "2026-03-29T10:00:01.000Z" });

    const result = await createUserMessage({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com",
      content: "Hello there",
      attachments: [],
      metadata: { pageUrl: "https://example.com/pricing" }
    } as never);

    expect(mocks.insertMessage).toHaveBeenNthCalledWith(
      1,
      "conv_1",
      "user",
      "Hello there",
      [],
      { reopenConversation: true }
    );
    expect(mocks.insertMessage).toHaveBeenNthCalledWith(
      2,
      "conv_1",
      "team",
      "Thanks for reaching out. We'll reply shortly.",
      [],
      { reopenConversation: false }
    );
    expect(result.automationReply).toMatchObject({ id: "msg_2" });
  });

  it("includes matching manual FAQ suggestions for the first visitor message", async () => {
    mocks.findWorkspaceAutomationSettingsValue.mockResolvedValue(
      JSON.stringify({
        speed: {
          faqSuggestionsEnabled: true,
          manualFaqs: [
            {
              id: "faq_1",
              question: "What are your pricing plans?",
              keywords: ["pricing", "plans", "cost"],
              answer: "We offer Free, Growth, and Business plans.",
              link: "https://example.com/pricing"
            }
          ]
        }
      })
    );

    const result = await createUserMessage({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com",
      content: "pricing help",
      attachments: [],
      metadata: { pageUrl: "https://example.com/pricing" }
    } as never);

    expect(result.faqSuggestions).toEqual({
      fallbackMessage: "None of these help? A team member will be with you shortly.",
      items: [
        {
          id: "faq_1",
          question: "What are your pricing plans?",
          answer: "We offer Free, Growth, and Business plans.",
          link: "https://example.com/pricing"
        }
      ]
    });
    expect(result.deferTeamNotification).toBe(true);
    expect(mocks.setConversationFaqHandoffState).toHaveBeenCalledWith({
      conversationId: "conv_1",
      preview: "Hello there",
      attachmentsCount: 0,
      isNewVisitor: true,
      highIntent: true,
      suggestions: {
        fallbackMessage: "None of these help? A team member will be with you shortly.",
        items: [
          {
            id: "faq_1",
            question: "What are your pricing plans?",
            answer: "We offer Free, Growth, and Business plans.",
            link: "https://example.com/pricing"
          }
        ]
      },
      suggestionsJson: JSON.stringify({
        items: [
          {
            id: "faq_1",
            question: "What are your pricing plans?",
            answer: "We offer Free, Growth, and Business plans.",
            link: "https://example.com/pricing"
          }
        ],
        fallbackMessage: "None of these help? A team member will be with you shortly."
      })
    });
  });

  it("auto-assigns new conversations to the matched teammate and applies matching tags", async () => {
    mocks.findWorkspaceAutomationSettingsValue.mockResolvedValue(
      JSON.stringify({
        routing: {
          assignRules: [
            {
              id: "assign_1",
              condition: "first_message_contains",
              value: "pricing, plans",
              target: { type: "member", memberId: "member_1" }
            }
          ],
          tagRules: [
            {
              id: "tag_1",
              condition: "page_url_contains",
              value: "/pricing",
              tag: "sales-lead"
            },
            {
              id: "tag_2",
              condition: "first_message_contains",
              value: "pricing",
              tag: "pricing-question"
            }
          ]
        }
      })
    );
    mocks.findConversationNotificationContextRow.mockResolvedValue({
      user_id: "member_1",
      owner_user_id: "owner_1",
      site_name: "Main site"
    });
    mocks.queryConversationSummaries.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: "conv_1", page_url: "https://example.com/pricing", city: "London", region: "England", country: "UK" }]
    });

    const result = await createUserMessage({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com",
      content: "I have a pricing question",
      attachments: [],
      metadata: { pageUrl: "https://example.com/pricing" }
    } as never);

    expect(mocks.updateConversationAssignmentRecord).toHaveBeenCalledWith({
      conversationId: "conv_1",
      ownerUserId: "owner_1",
      assignedUserId: "member_1"
    });
    expect(mocks.insertConversationTag).toHaveBeenCalledWith("conv_1", "sales-lead");
    expect(mocks.insertConversationTag).toHaveBeenCalledWith("conv_1", "pricing-question");
    expect(result.notification).toMatchObject({
      userId: "member_1",
      conversationId: "conv_1"
    });
  });

  it("routes live using visitor tags and custom fields from the visitor profile", async () => {
    mocks.findWorkspaceAutomationSettingsValue.mockResolvedValue(
      JSON.stringify({
        routing: {
          assignRules: [
            {
              id: "assign_1",
              condition: "visitor_tag",
              value: "enterprise",
              target: { type: "member", memberId: "member_1" }
            }
          ],
          tagRules: [
            {
              id: "tag_1",
              condition: "custom_field_equals",
              value: "plan = Growth",
              tag: "growth-lead"
            }
          ]
        }
      })
    );
    mocks.findVisitorPresenceSessionRow.mockResolvedValue({
      tags_json: ["enterprise"],
      custom_fields_json: { plan: "Growth" }
    });
    mocks.findConversationNotificationContextRow.mockResolvedValue({
      user_id: "member_1",
      owner_user_id: "owner_1",
      site_name: "Main site"
    });

    const result = await createUserMessage({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com",
      content: "hello",
      attachments: [],
      metadata: { pageUrl: "https://example.com/enterprise" }
    } as never);

    expect(mocks.updateConversationAssignmentRecord).toHaveBeenCalledWith({
      conversationId: "conv_1",
      ownerUserId: "owner_1",
      assignedUserId: "member_1"
    });
    expect(mocks.insertConversationTag).toHaveBeenCalledWith("conv_1", "growth-lead");
    expect(result.notification?.userId).toBe("member_1");
  });

  it("uses round robin assignment for matched assign rules", async () => {
    mocks.findWorkspaceAutomationSettingsValue.mockResolvedValue(
      JSON.stringify({
        routing: {
          assignRules: [
            {
              id: "assign_1",
              condition: "page_url_contains",
              value: "/docs",
              target: { type: "round_robin" }
            }
          ],
          tagRules: []
        }
      })
    );
    mocks.findNextRoundRobinAssigneeUserId.mockResolvedValue("member_2");
    mocks.findConversationNotificationContextRow.mockResolvedValue({
      user_id: "member_2",
      owner_user_id: "owner_1",
      site_name: "Main site"
    });
    mocks.queryConversationSummaries.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: "conv_1", page_url: "https://example.com/docs/install", city: "London", region: "England", country: "UK" }]
    });

    const result = await createUserMessage({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com",
      content: "help me install",
      attachments: [],
      metadata: { pageUrl: "https://example.com/docs/install" }
    } as never);

    expect(mocks.findNextRoundRobinAssigneeUserId).toHaveBeenCalledWith("owner_1");
    expect(mocks.updateConversationAssignmentRecord).toHaveBeenCalledWith({
      conversationId: "conv_1",
      ownerUserId: "owner_1",
      assignedUserId: "member_2"
    });
    expect(result.notification?.userId).toBe("member_2");
  });

  it("releases a pending FAQ handoff on the next visitor message and notifies it as a new conversation", async () => {
    mocks.ensureConversation.mockResolvedValue({
      conversationId: "conv_1",
      createdConversation: false,
      emailCaptured: false
    });
    mocks.findConversationFaqHandoffState.mockResolvedValue({
      pending: true,
      preview: "Need pricing help",
      attachmentsCount: 0,
      isNewVisitor: true,
      highIntent: true
    });
    mocks.isHighIntentPage.mockReturnValue(false);

    const result = await createUserMessage({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com",
      content: "Can a human jump in?",
      attachments: [],
      metadata: { pageUrl: "https://example.com/docs" }
    } as never);

    expect(result.deferTeamNotification).toBe(false);
    expect(mocks.clearConversationFaqHandoffState).toHaveBeenCalledWith("conv_1");
    expect(result.notification).toMatchObject({
      conversationId: "conv_1",
      preview: "Hello there",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true
    });
  });

  it("updates saved visitor emails and migrates the visitor identity", async () => {
    mocks.findVisitorConversationEmailState.mockResolvedValueOnce({ email: null, user_id: "owner_1" });
    mocks.updateVisitorConversationEmailRecord.mockResolvedValueOnce(true);

    const result = await saveVisitorConversationEmail({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1",
      email: "alex@example.com"
    });

    expect(result).toEqual({ updated: true, welcomeEmailEligible: true, ownerUserId: "owner_1" });
    expect(mocks.migrateVisitorNoteIdentity).toHaveBeenCalledWith(expect.objectContaining({ nextEmail: "alex@example.com" }));
    expect(mocks.recordVisitorPresence).toHaveBeenCalledWith(expect.objectContaining({ email: "alex@example.com" }));
    expect(mocks.updateVisitorPresenceSessionEmail).toHaveBeenCalledWith({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com"
    });
  });

  it("loads a full conversation thread when both summary and activity exist", async () => {
    const thread = await getConversationById("conv_1", "user_1");

    expect(thread).toEqual({
      id: "conv_1",
      pageUrl: "https://example.com/pricing",
      city: "London",
      region: "England",
      country: "UK",
      messages: [{ id: "msg_1" }],
      visitorActivity: { matchType: "email" }
    });
    expect(mocks.overlayConversationSummaryWithLivePresence).toHaveBeenCalledWith(
      expect.objectContaining({ id: "conv_1", pageUrl: "https://example.com/pricing" }),
      { ownerUserId: "owner_1", viewerUserId: "user_1" }
    );
  });

  it("updates visitor typing by inserting or deleting the typing record", async () => {
    mocks.getPublicConversationAccess.mockResolvedValue(true);

    await expect(updateVisitorTyping({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", typing: true })).resolves.toBe(true);
    await expect(updateVisitorTyping({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", typing: false })).resolves.toBe(true);

    expect(mocks.upsertVisitorTypingRecord).toHaveBeenCalledWith("conv_1", "session_1");
    expect(mocks.deleteVisitorTypingRecord).toHaveBeenCalledWith("conv_1", "session_1");
  });
});
