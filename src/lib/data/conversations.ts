import {
  deleteConversationTag,
  deleteConversationTypingRecord,
  deleteVisitorTypingRecord,
  findActiveConversationTyping,
  findConversationById,
  findConversationEmailById,
  findConversationEmailStateForUser,
  findConversationIdentityForActivity,
  findConversationNotificationContextRow,
  findConversationTag,
  findPublicAttachmentRecord,
  findVisitorConversationEmailState,
  insertConversationTag,
  updateConversationStatusRecord,
  updateVisitorConversationEmailRecord,
  upsertConversationFeedback,
  upsertConversationRead,
  upsertConversationTypingRecord,
  upsertVisitorTypingRecord
} from "@/lib/repositories/conversations-repository";
import { findWorkspaceAutomationSettingsValue } from "@/lib/repositories/settings-repository";
import { findSitePresenceRow } from "@/lib/repositories/sites-repository";
import { updateVisitorPresenceSessionEmail } from "@/lib/repositories/visitor-presence-repository";
import type { ConversationRating, ConversationStatus, ConversationThread, VisitorActivity } from "@/lib/types";
import { optionalText } from "@/lib/utils";
import { isHighIntentPage, previewIncomingMessage } from "@/lib/notification-utils";
import { getWidgetFaqSuggestions, shouldSendWidgetAutoReply } from "@/lib/public-widget-automation";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { findConversationReplyDeliveryStateForUser } from "@/lib/repositories/conversation-reply-delivery-repository";
import { parseDashboardAutomationSettings } from "./settings-automation";
import { getSiteByPublicId } from "./sites";
import { migrateVisitorNoteIdentity } from "./visitor-notes";
import { recordVisitorPresence, syncVisitorContact } from "./visitors";
import {
  ensureConversation,
  getConversationVisitorActivity,
  getPublicConversationAccess,
  hasPreviousVisitorConversation,
  insertMessage,
  loadConversationMessages,
  upsertMetadata
} from "./conversations-internals";
import {
  hasConversationAccess,
  mapAttachment,
  mapMessage,
  mapSummary,
  overlayConversationSummaryWithLivePresence,
  queryConversationSummaries,
  updateConversationEmailValue,
  type CreateUserMessageInput,
  type UploadedAttachmentInput
} from "./shared";
import {
  clearConversationFaqHandoff,
  loadConversationFaqHandoffState,
  queueConversationFaqHandoff,
  requestConversationFaqHandoff
} from "./conversation-faq-handoff";
import { loadConversationNotificationSnapshot } from "./conversation-notification-snapshot";
import { applyConversationAutomationRouting } from "./conversation-routing";

async function getWidgetAutomationSnapshot(site: NonNullable<Awaited<ReturnType<typeof getSiteByPublicId>>>) {
  const [automationSettingsJson, presence] = await Promise.all([
    findWorkspaceAutomationSettingsValue(site.userId),
    findSitePresenceRow(site.id)
  ]);

  return {
    automation: parseDashboardAutomationSettings(automationSettingsJson, {
      requireEmailWhenOffline: site.requireEmailOffline,
      expectedReplyTimeOnline: site.responseTimeMode
    }),
    lastSeenAt: presence?.last_seen_at ?? null
  };
}

async function maybeCreateWidgetAutoReply(input: {
  site: NonNullable<Awaited<ReturnType<typeof getSiteByPublicId>>>;
  conversationId: string;
  createdConversation: boolean;
  automationSnapshot: Awaited<ReturnType<typeof getWidgetAutomationSnapshot>> | null;
}) {
  if (!input.createdConversation || !input.automationSnapshot) {
    return null;
  }

  if (!shouldSendWidgetAutoReply({
    site: input.site,
    automation: input.automationSnapshot.automation,
    isNewConversation: input.createdConversation,
    lastSeenAt: input.automationSnapshot.lastSeenAt
  })) {
    return null;
  }

  return insertMessage(
    input.conversationId,
    "team",
    input.automationSnapshot.automation.offline.autoReplyMessage,
    [],
    { reopenConversation: false }
  );
}

async function hasScopedConversationAccess(conversationId: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  return hasConversationAccess(conversationId, workspace.ownerUserId, userId);
}

export async function createUserMessage(input: CreateUserMessageInput) {
  const site = await getSiteByPublicId(input.siteId);

  if (!site) {
    throw new Error("SITE_NOT_FOUND");
  }

  const requestedConversation = input.conversationId?.trim()
    ? await findConversationById(input.conversationId.trim())
    : null;

  const { conversationId, createdConversation, emailCaptured } = await ensureConversation(input);
  const pendingFaqHandoff = createdConversation ? null : await loadConversationFaqHandoffState(conversationId);
  const isNewVisitor = createdConversation
    ? !(await hasPreviousVisitorConversation({
        siteId: input.siteId,
        conversationId,
        email: input.email,
        sessionId: input.sessionId
      }))
    : false;
  await migrateVisitorNoteIdentity({
    siteId: input.siteId,
    sessionId: input.sessionId,
    previousEmail:
      requestedConversation && requestedConversation.site_id === input.siteId
        ? requestedConversation.email
        : null,
    nextEmail: input.email
  });
  await upsertMetadata(conversationId, input.metadata);
  await recordVisitorPresence({
    siteId: input.siteId,
    sessionId: input.sessionId,
    conversationId,
    email: input.email,
    pageUrl: input.metadata.pageUrl,
    referrer: input.metadata.referrer,
    userAgent: input.metadata.userAgent,
    country: input.metadata.country,
    region: input.metadata.region,
    city: input.metadata.city,
    timezone: input.metadata.timezone,
    locale: input.metadata.locale,
    visitorTags: input.metadata.visitorTags,
    customFields: input.metadata.customFields
  });
  const message = await insertMessage(
    conversationId,
    "user",
    input.content,
    input.attachments,
    { reopenConversation: true }
  );
  const automationSnapshot = createdConversation ? await getWidgetAutomationSnapshot(site) : null;
  if (createdConversation && automationSnapshot) {
    await applyConversationAutomationRouting({
      conversationId,
      ownerUserId: site.userId,
      automation: automationSnapshot.automation,
      siteId: input.siteId,
      sessionId: input.sessionId,
      email: input.email,
      content: input.content,
      metadata: input.metadata
    });
  }
  const automationReply = await maybeCreateWidgetAutoReply({
    site,
    conversationId,
    createdConversation,
    automationSnapshot
  });
  const faqSuggestions = automationSnapshot
    ? getWidgetFaqSuggestions({
        automation: automationSnapshot.automation,
        content: input.content,
        isNewConversation: createdConversation
      })
    : null;
  const notificationSnapshot = await loadConversationNotificationSnapshot(conversationId);
  const preview = previewIncomingMessage(input.content, input.attachments?.length ?? 0);
  const fallbackLocation =
    [input.metadata.city, input.metadata.region, input.metadata.country].filter(Boolean).join(", ") || null;
  const highIntent = createdConversation
    && isHighIntentPage(notificationSnapshot?.pageUrl ?? input.metadata.pageUrl ?? null);

  if (faqSuggestions) {
    await queueConversationFaqHandoff({
      conversationId,
      preview,
      attachmentsCount: input.attachments?.length ?? 0,
      isNewVisitor,
      highIntent,
      suggestions: faqSuggestions
    });
  } else if (pendingFaqHandoff?.pending) {
    await clearConversationFaqHandoff(conversationId);
  }

  const notification = {
    userId: notificationSnapshot?.userId ?? site.userId,
    conversationId,
    createdAt: message.createdAt,
    preview,
    siteName: notificationSnapshot?.siteName ?? site.name,
    visitorLabel: notificationSnapshot?.visitorLabel ?? optionalText(input.email),
    pageUrl: notificationSnapshot?.pageUrl ?? input.metadata.pageUrl ?? null,
    location: notificationSnapshot?.location ?? fallbackLocation,
    attachmentsCount: input.attachments?.length ?? 0,
    isNewConversation: createdConversation || Boolean(pendingFaqHandoff?.pending),
    isNewVisitor: pendingFaqHandoff?.pending ? pendingFaqHandoff.isNewVisitor : isNewVisitor,
    highIntent: pendingFaqHandoff?.pending ? pendingFaqHandoff.highIntent : highIntent
  };

  return {
    conversationId,
    message,
    automationReply,
    siteUserId: site.userId,
    siteName: site.name,
    preview,
    pageUrl: notification.pageUrl,
    location: notification.location,
    visitorLabel: notification.visitorLabel,
    isNewConversation: createdConversation,
    isNewVisitor,
    highIntent,
    welcomeEmailEligible: emailCaptured,
    faqSuggestions,
    deferTeamNotification: Boolean(faqSuggestions),
    notification
  };
}

export async function getPublicConversationMessages(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  if (!(await getPublicConversationAccess(input))) {
    return null;
  }

  return loadConversationMessages(
    input.conversationId,
    (attachmentId) =>
      `/api/files/${attachmentId}?conversationId=${encodeURIComponent(input.conversationId)}&siteId=${encodeURIComponent(input.siteId)}&sessionId=${encodeURIComponent(input.sessionId)}`
  );
}

export async function getPublicConversationState(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  const messages = await getPublicConversationMessages(input);
  if (!messages) {
    return null;
  }

  const faqHandoff = await loadConversationFaqHandoffState(input.conversationId);

  return {
    messages,
    faqSuggestions: faqHandoff?.pending ? faqHandoff.suggestions ?? null : null
  };
}

export async function handoffPublicConversationToTeam(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  return requestConversationFaqHandoff(input);
}

export async function getPublicConversationTypingStatus(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
}) {
  if (!(await getPublicConversationAccess(input))) {
    return null;
  }

  return {
    teamTyping: await findActiveConversationTyping(input.conversationId)
  };
}

export async function saveVisitorConversationEmail(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
  email: string;
}) {
  const email = optionalText(input.email);

  if (!email) {
    throw new Error("EMAIL_REQUIRED");
  }

  const before = await findVisitorConversationEmailState({
    conversationId: input.conversationId,
    siteId: input.siteId,
    sessionId: input.sessionId
  });

  if (!before) {
    return {
      updated: false,
      welcomeEmailEligible: false,
      ownerUserId: null
    };
  }

  const updated = await updateVisitorConversationEmailRecord({
    conversationId: input.conversationId,
    siteId: input.siteId,
    sessionId: input.sessionId,
    email
  });

  if (updated) {
    await migrateVisitorNoteIdentity({
      siteId: input.siteId,
      sessionId: input.sessionId,
      previousEmail: before.email,
      nextEmail: email
    });
    await recordVisitorPresence({
      siteId: input.siteId,
      sessionId: input.sessionId,
      conversationId: input.conversationId,
      email
    });
    await updateVisitorPresenceSessionEmail({
      siteId: input.siteId,
      sessionId: input.sessionId,
      email
    });
  }

  return {
    updated,
    welcomeEmailEligible: !optionalText(before.email),
    ownerUserId: before.user_id
  };
}

export async function addTeamReply(
  conversationId: string,
  content: string,
  userId: string,
  attachments: UploadedAttachmentInput[] = []
) {
  if (!(await hasScopedConversationAccess(conversationId, userId))) {
    return false;
  }

  return insertMessage(conversationId, "team", content, attachments, { authorUserId: userId });
}

export async function addInboundReply(
  conversationId: string,
  email: string | null,
  content: string,
  attachments: UploadedAttachmentInput[] = []
) {
  const conversation = await findConversationById(conversationId);
  if (conversation) {
    await migrateVisitorNoteIdentity({
      siteId: conversation.site_id,
      sessionId: conversation.session_id,
      previousEmail: conversation.email,
      nextEmail: email
    });

    if (email) {
      await syncVisitorContact({
        siteId: conversation.site_id,
        sessionId: conversation.session_id,
        conversationId,
        email
      });
      await updateVisitorPresenceSessionEmail({
        siteId: conversation.site_id,
        sessionId: conversation.session_id,
        email
      });
    }
  }

  await updateConversationEmailValue(conversationId, email, "merge");
  return insertMessage(conversationId, "user", content, attachments, { reopenConversation: true });
}

export async function getConversationNotificationContext(conversationId: string) {
  const context = await findConversationNotificationContextRow(conversationId);
  if (!context) {
    return null;
  }

  const summary = await getConversationSummaryById(
    conversationId,
    context.owner_user_id ?? context.user_id
  );

  return {
    userId: context.user_id,
    siteName: context.site_name,
    summary
  };
}

export async function listConversationSummaries(userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const result = await queryConversationSummaries(
    "s.user_id = $1",
    [workspace.ownerUserId],
    "ORDER BY c.last_message_at DESC NULLS LAST, c.updated_at DESC",
    userId
  );

  return result.rows.map(mapSummary);
}

export async function getConversationSummaryById(id: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const result = await queryConversationSummaries(
    "c.id = $1 AND s.user_id = $2",
    [id, workspace.ownerUserId],
    "LIMIT 1",
    userId
  );

  if (!result.rowCount) {
    return null;
  }

  return overlayConversationSummaryWithLivePresence(mapSummary(result.rows[0]), {
    ownerUserId: workspace.ownerUserId,
    viewerUserId: userId
  });
}

export async function getConversationById(id: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);
  const [summaryResult, visitorActivity] = await Promise.all([
    queryConversationSummaries("c.id = $1 AND s.user_id = $2", [id, workspace.ownerUserId], "LIMIT 1", userId),
    getConversationVisitorActivity(id, userId)
  ]);

  if (!summaryResult.rowCount || !visitorActivity) {
    return null;
  }

  const messages = await loadConversationMessages(
    id,
    (attachmentId) => `/api/files/${attachmentId}?conversationId=${encodeURIComponent(id)}`
  );
  const summary = await overlayConversationSummaryWithLivePresence(
    mapSummary(summaryResult.rows[0]),
    {
      ownerUserId: workspace.ownerUserId,
      viewerUserId: userId
    }
  );

  return {
    ...summary,
    messages,
    visitorActivity
  } satisfies ConversationThread;
}

export async function toggleTag(conversationId: string, tag: string, userId: string) {
  if (!(await hasScopedConversationAccess(conversationId, userId))) {
    return false;
  }

  const normalizedTag = tag.trim().toLowerCase();
  if (await findConversationTag(conversationId, normalizedTag)) {
    await deleteConversationTag(conversationId, normalizedTag);
    return true;
  }

  await insertConversationTag(conversationId, normalizedTag);

  return true;
}

export async function recordFeedback(conversationId: string, rating: ConversationRating) {
  await upsertConversationFeedback(conversationId, rating);
}

export async function updateConversationEmail(conversationId: string, email: string, userId: string) {
  const workspace = await getWorkspaceAccess(userId);

  if (!(await hasScopedConversationAccess(conversationId, userId))) {
    return {
      updated: false,
      welcomeEmailEligible: false
    };
  }

  const previousEmail = await findConversationEmailById(conversationId);
  const identityBefore = await findConversationIdentityForActivity(conversationId, workspace.ownerUserId);

  await updateConversationEmailValue(conversationId, email, "replace");
  if (identityBefore) {
    await migrateVisitorNoteIdentity({
      siteId: identityBefore.site_id,
      sessionId: identityBefore.session_id,
      previousEmail,
      nextEmail: email,
      updatedByUserId: userId
    });
    await syncVisitorContact({
      siteId: identityBefore.site_id,
      sessionId: identityBefore.session_id,
      conversationId,
      email
    });
    await updateVisitorPresenceSessionEmail({
      siteId: identityBefore.site_id,
      sessionId: identityBefore.session_id,
      email
    });
  }
  return {
    updated: true,
    welcomeEmailEligible: !optionalText(previousEmail)
  };
}

export async function getConversationEmail(conversationId: string, userId: string) {
  if (!(await hasScopedConversationAccess(conversationId, userId))) {
    return null;
  }

  const workspace = await getWorkspaceAccess(userId);
  return findConversationEmailStateForUser(conversationId, workspace.ownerUserId);
}

export async function getConversationReplyDeliveryState(conversationId: string, userId: string) {
  if (!(await hasScopedConversationAccess(conversationId, userId))) {
    return null;
  }

  const workspace = await getWorkspaceAccess(userId);
  return findConversationReplyDeliveryStateForUser(conversationId, workspace.ownerUserId);
}

export async function markConversationRead(conversationId: string, userId: string) {
  if (!(await hasScopedConversationAccess(conversationId, userId))) {
    return false;
  }

  await upsertConversationRead(userId, conversationId);

  return true;
}

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
  userId: string
) {
  if (!(await hasScopedConversationAccess(conversationId, userId))) {
    return null;
  }

  const workspace = await getWorkspaceAccess(userId);
  return updateConversationStatusRecord(conversationId, workspace.ownerUserId, status);
}

export async function getAttachmentForPublic(input: {
  attachmentId: string;
  conversationId: string;
  siteId: string;
  sessionId: string;
}) {
  if (!(await getPublicConversationAccess(input))) {
    return null;
  }

  return findPublicAttachmentRecord(input.attachmentId, input.conversationId);
}

export async function getAttachmentForUser(input: {
  attachmentId: string;
  conversationId: string;
  userId: string;
}) {
  if (!(await hasScopedConversationAccess(input.conversationId, input.userId))) {
    return null;
  }

  return findPublicAttachmentRecord(input.attachmentId, input.conversationId);
}

export async function updateConversationTyping(input: {
  conversationId: string;
  userId: string;
  typing: boolean;
}) {
  if (!(await hasScopedConversationAccess(input.conversationId, input.userId))) {
    return false;
  }

  if (!input.typing) {
    await deleteConversationTypingRecord(input.userId, input.conversationId);
    return true;
  }

  await upsertConversationTypingRecord(input.userId, input.conversationId);

  return true;
}

export async function updateVisitorTyping(input: {
  siteId: string;
  sessionId: string;
  conversationId: string;
  typing: boolean;
}) {
  if (!(await getPublicConversationAccess(input))) {
    return false;
  }

  if (!input.typing) {
    await deleteVisitorTypingRecord(input.conversationId, input.sessionId);
    return true;
  }

  await upsertVisitorTypingRecord(input.conversationId, input.sessionId);

  return true;
}
