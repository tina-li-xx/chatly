import { useState } from "react";
import { useDashboardLive } from "./use-dashboard-live";

export function useThreadLiveState(input: {
  baseUrl: string;
  token: string;
  conversationId: string;
  onRefresh(): void;
}) {
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [teamTyping, setTeamTyping] = useState(false);

  const { connectionState } = useDashboardLive({
    baseUrl: input.baseUrl,
    token: input.token,
    onError: input.onRefresh,
    onMessage: (event) => {
      if (event.type === "connected" || event.conversationId !== input.conversationId) {
        return;
      }
      if (event.type === "typing.updated") {
        if (event.actor === "visitor") setVisitorTyping(event.typing);
        if (event.actor === "team") setTeamTyping(event.typing);
        return;
      }
      if (event.type === "message.created") {
        setVisitorTyping(false);
        setTeamTyping(false);
      }
      input.onRefresh();
    }
  });

  return { connectionState, teamTyping, visitorTyping };
}
