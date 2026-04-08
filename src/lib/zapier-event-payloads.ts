import "server-only";

export type ZapierConversationCreatedPayload = {
  event: "conversation.created";
  timestamp: string;
  data__conversation_id: string;
  data__visitor_email: string | null;
  data__visitor_name: string | null;
  data__page_url: string | null;
  data__first_message: string;
  data__assigned_to: string | null;
  data: {
    conversation_id: string;
    visitor_email: string | null;
    visitor_name: string | null;
    page_url: string | null;
    first_message: string;
    tags: string[];
    assigned_to: string | null;
  };
};

export type ZapierConversationResolvedPayload = {
  event: "conversation.resolved";
  timestamp: string;
  data__conversation_id: string;
  data__visitor_email: string | null;
  data__resolved_by: string;
  data__message_count: number;
  data__duration_seconds: number;
  data: {
    conversation_id: string;
    visitor_email: string | null;
    resolved_by: string;
    message_count: number;
    duration_seconds: number;
  };
};

export type ZapierContactCreatedPayload = {
  event: "contact.created";
  timestamp: string;
  data__contact_id: string;
  data__email: string;
  data__name: string;
  data__company: string | null;
  data__source: string;
  data: {
    contact_id: string;
    email: string;
    name: string;
    company: string | null;
    source: string;
  };
};

export type ZapierTagAddedPayload = {
  event: "tag.added";
  timestamp: string;
  data__conversation_id: string;
  data__tag: string;
  data__added_by: string;
  data: {
    conversation_id: string;
    tag: string;
    added_by: string;
  };
};

export type ZapierEventPayload =
  | ZapierConversationCreatedPayload
  | ZapierConversationResolvedPayload
  | ZapierContactCreatedPayload
  | ZapierTagAddedPayload;

function isoTimestamp(value?: string | null) {
  return value ? new Date(value).toISOString() : new Date().toISOString();
}

export function buildZapierConversationCreatedPayload(input: {
  conversationId: string;
  visitorEmail: string | null;
  visitorName: string | null;
  pageUrl: string | null;
  firstMessage: string;
  tags: string[];
  assignedTo: string | null;
  createdAt?: string | null;
}): ZapierConversationCreatedPayload {
  return {
    event: "conversation.created",
    timestamp: isoTimestamp(input.createdAt),
    data__conversation_id: input.conversationId,
    data__visitor_email: input.visitorEmail,
    data__visitor_name: input.visitorName,
    data__page_url: input.pageUrl,
    data__first_message: input.firstMessage,
    data__assigned_to: input.assignedTo,
    data: {
      conversation_id: input.conversationId,
      visitor_email: input.visitorEmail,
      visitor_name: input.visitorName,
      page_url: input.pageUrl,
      first_message: input.firstMessage,
      tags: input.tags,
      assigned_to: input.assignedTo
    }
  };
}

export function buildZapierConversationResolvedPayload(input: {
  conversationId: string;
  visitorEmail: string | null;
  resolvedBy: string;
  messageCount: number;
  durationSeconds: number;
  timestamp?: string | null;
}): ZapierConversationResolvedPayload {
  return {
    event: "conversation.resolved",
    timestamp: isoTimestamp(input.timestamp),
    data__conversation_id: input.conversationId,
    data__visitor_email: input.visitorEmail,
    data__resolved_by: input.resolvedBy,
    data__message_count: input.messageCount,
    data__duration_seconds: input.durationSeconds,
    data: {
      conversation_id: input.conversationId,
      visitor_email: input.visitorEmail,
      resolved_by: input.resolvedBy,
      message_count: input.messageCount,
      duration_seconds: input.durationSeconds
    }
  };
}

export function buildZapierContactCreatedPayload(input: {
  contactId: string;
  email: string;
  name: string;
  company: string | null;
  source: string;
  timestamp?: string | null;
}): ZapierContactCreatedPayload {
  return {
    event: "contact.created",
    timestamp: isoTimestamp(input.timestamp),
    data__contact_id: input.contactId,
    data__email: input.email,
    data__name: input.name,
    data__company: input.company,
    data__source: input.source,
    data: {
      contact_id: input.contactId,
      email: input.email,
      name: input.name,
      company: input.company,
      source: input.source
    }
  };
}

export function buildZapierTagAddedPayload(input: {
  conversationId: string;
  tag: string;
  addedBy: string;
  timestamp?: string | null;
}): ZapierTagAddedPayload {
  return {
    event: "tag.added",
    timestamp: isoTimestamp(input.timestamp),
    data__conversation_id: input.conversationId,
    data__tag: input.tag,
    data__added_by: input.addedBy,
    data: {
      conversation_id: input.conversationId,
      tag: input.tag,
      added_by: input.addedBy
    }
  };
}
