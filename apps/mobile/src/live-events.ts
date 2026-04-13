export type DashboardLiveEvent =
  | {
      type: "message.created";
      conversationId: string;
      sender: "user" | "team";
      createdAt: string;
    }
  | {
      type: "conversation.updated";
      conversationId: string;
      status: "open" | "resolved";
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
      actor: "visitor" | "team";
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

export type DashboardLiveMessage = DashboardLiveEvent | { type: "connected" };
