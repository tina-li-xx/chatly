import type { ConversationStatus, Sender } from "@/lib/types";

type DashboardTypingActor = "visitor" | "team";

export type DashboardLiveEvent =
  | {
      type: "message.created";
      conversationId: string;
      sender: Sender;
      createdAt: string;
      preview?: string | null;
      pageUrl?: string | null;
      location?: string | null;
      siteName?: string | null;
      visitorLabel?: string | null;
      isNewConversation?: boolean;
      isNewVisitor?: boolean;
      highIntent?: boolean;
    }
  | {
      type: "conversation.updated";
      conversationId: string;
      status: ConversationStatus;
      updatedAt: string;
    }
  | {
      type: "conversation.read";
      conversationId: string;
      updatedAt: string;
    }
  | {
      type: "typing.updated";
      conversationId: string;
      actor: DashboardTypingActor;
      typing: boolean;
    }
  | {
      type: "visitor.presence.updated";
      siteId: string;
      sessionId: string;
      conversationId: string | null;
      pageUrl: string | null;
      updatedAt: string;
    };

export type PublicConversationLiveEvent =
  | {
      type: "message.created";
      conversationId: string;
      sender: Sender;
      createdAt: string;
    }
  | {
      type: "typing.updated";
      conversationId: string;
      actor: "team";
      typing: boolean;
    }
  | {
      type: "conversation.updated";
      conversationId: string;
      status: ConversationStatus;
      updatedAt: string;
    };

type Listener<T> = (event: T) => void;

declare global {
  // eslint-disable-next-line no-var
  var __chattingLiveListeners:
    | {
        dashboardByUserId: Map<string, Set<Listener<DashboardLiveEvent>>>;
        conversationById: Map<string, Set<Listener<PublicConversationLiveEvent>>>;
      }
    | undefined;
}

function getState() {
  if (!global.__chattingLiveListeners) {
    global.__chattingLiveListeners = {
      dashboardByUserId: new Map(),
      conversationById: new Map()
    };
  }

  return global.__chattingLiveListeners;
}

function subscribe<T>(
  bucket: Map<string, Set<Listener<T>>>,
  key: string,
  listener: Listener<T>
) {
  const current = bucket.get(key) ?? new Set<Listener<T>>();
  current.add(listener);
  bucket.set(key, current);

  return () => {
    const listeners = bucket.get(key);
    if (!listeners) {
      return;
    }

    listeners.delete(listener);

    if (!listeners.size) {
      bucket.delete(key);
    }
  };
}

function publish<T>(bucket: Map<string, Set<Listener<T>>>, key: string, event: T) {
  const listeners = bucket.get(key);
  if (!listeners?.size) {
    return;
  }

  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      console.error("live event listener failed", error);
    }
  }
}

export function subscribeDashboardLive(userId: string, listener: Listener<DashboardLiveEvent>) {
  return subscribe(getState().dashboardByUserId, userId, listener);
}

export function publishDashboardLive(userId: string, event: DashboardLiveEvent) {
  publish(getState().dashboardByUserId, userId, event);
}

export function subscribeConversationLive(
  conversationId: string,
  listener: Listener<PublicConversationLiveEvent>
) {
  return subscribe(getState().conversationById, conversationId, listener);
}

export function publishConversationLive(
  conversationId: string,
  event: PublicConversationLiveEvent
) {
  publish(getState().conversationById, conversationId, event);
}
