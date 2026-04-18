import type {
  ConversationStatus,
  ConversationSummary,
  Sender,
  VisitorPresenceSession
} from "@/lib/types";

export type DashboardTypingActor = "visitor" | "team";

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
      summary?: ConversationSummary | null;
    }
  | {
      type: "conversation.updated";
      conversationId: string;
      status: ConversationStatus;
      updatedAt: string;
      assignedUserId?: string | null;
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
      type: "team.presence.updated";
      userId: string;
      updatedAt: string;
    }
  | {
      type: "team.members.updated";
      updatedAt: string;
    }
  | {
      type: "visitor.presence.updated";
      siteId: string;
      sessionId: string;
      conversationId: string | null;
      pageUrl: string | null;
      updatedAt: string;
      session?: VisitorPresenceSession | null;
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

export type LiveEventListener<T> = (event: T) => void;
