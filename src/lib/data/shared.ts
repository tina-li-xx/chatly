import type {
  ConversationSummary,
  MessageAttachment,
  Site,
  ThreadMessage
} from "@/lib/types";
import { optionalText } from "@/lib/utils";
import {
  hasConversationAccess,
  queryConversationSummaries,
  queryMessageAttachmentRows,
  querySites,
  type AttachmentRow,
  type MessageRow,
  type SiteRow,
  type SummaryRow,
  updateConversationEmailValue
} from "@/lib/repositories/shared-repository";
import {
  DEFAULT_AVATAR_STYLE,
  DEFAULT_LAUNCHER_POSITION,
  DEFAULT_RESPONSE_TIME_MODE,
  createDefaultOperatingHours,
  normalizeAvatarStyle,
  normalizeLauncherPosition,
  normalizeResponseTimeMode,
  parseOperatingHours
} from "@/lib/widget-settings";

export {
  hasConversationAccess,
  queryConversationSummaries,
  queryMessageAttachmentRows,
  querySites,
  updateConversationEmailValue
};

export type CreateUserMessageInput = {
  siteId: string;
  conversationId?: string | null;
  sessionId: string;
  email?: string | null;
  content: string;
  attachments?: UploadedAttachmentInput[];
  metadata: {
    pageUrl?: string | null;
    referrer?: string | null;
    userAgent?: string | null;
    country?: string | null;
    region?: string | null;
    city?: string | null;
    timezone?: string | null;
    locale?: string | null;
  };
};

export type UploadedAttachmentInput = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  content: Buffer;
};

export function mapSite(row: SiteRow): Site {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    domain: row.domain,
    brandColor: row.brand_color,
    widgetTitle: row.widget_title,
    greetingText: row.greeting_text,
    launcherPosition: normalizeLauncherPosition(row.launcher_position ?? DEFAULT_LAUNCHER_POSITION),
    avatarStyle: normalizeAvatarStyle(row.avatar_style ?? DEFAULT_AVATAR_STYLE),
    teamPhotoUrl: optionalText(row.team_photo_url),
    showOnlineStatus: row.show_online_status ?? true,
    requireEmailOffline: row.require_email_offline ?? false,
    soundNotifications: row.sound_notifications ?? false,
    autoOpenPaths: row.auto_open_paths ?? [],
    responseTimeMode: normalizeResponseTimeMode(row.response_time_mode ?? DEFAULT_RESPONSE_TIME_MODE),
    operatingHoursEnabled: row.operating_hours_enabled ?? false,
    operatingHoursTimezone: optionalText(row.operating_hours_timezone),
    operatingHours: row.operating_hours_json
      ? parseOperatingHours(row.operating_hours_json)
      : createDefaultOperatingHours(),
    widgetInstallVerifiedAt: row.widget_install_verified_at,
    widgetInstallVerifiedUrl: optionalText(row.widget_install_verified_url),
    widgetLastSeenAt: row.widget_last_seen_at,
    widgetLastSeenUrl: optionalText(row.widget_last_seen_url),
    createdAt: row.created_at,
    conversationCount: Number(row.conversation_count)
  };
}

export function mapSummary(row: SummaryRow): ConversationSummary {
  return {
    id: row.id,
    siteId: row.site_id,
    siteName: row.site_name,
    email: row.email,
    sessionId: row.session_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pageUrl: row.page_url,
    referrer: row.referrer,
    userAgent: row.user_agent,
    country: row.country,
    region: row.region,
    city: row.city,
    timezone: row.timezone,
    locale: row.locale,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    unreadCount: Number(row.unread_count ?? 0),
    helpful: row.helpful,
    tags: row.tags ?? []
  };
}

export function mapAttachment(
  row: AttachmentRow,
  url: string
): MessageAttachment {
  return {
    id: row.id,
    fileName: row.file_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    url,
    isImage: row.content_type.startsWith("image/")
  };
}

export function mapMessage(row: MessageRow, attachments: MessageAttachment[] = []): ThreadMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: row.sender,
    content: row.content,
    createdAt: row.created_at,
    attachments
  };
}
