import { StyleSheet, Text, View } from "react-native";
import { mobileTheme } from "./mobile-theme";
import type { InboxFilter } from "./inbox-chrome";
import type { SessionUser } from "./types";

function copyForState(
  filter: InboxFilter,
  hasAnyConversations: boolean,
  workspaceRole: SessionUser["workspaceRole"]
) {
  if (workspaceRole === "member") {
    if (filter === "resolved") {
      return {
        title: "No resolved chats",
        text: "Resolved chats assigned to you will appear here."
      };
    }

    return {
      title: "No open chats",
      text: hasAnyConversations
        ? "Open chats assigned to you will appear here."
        : "Chats assigned to you will appear here."
    };
  }

  if (!hasAnyConversations) {
    return {
      title: "No conversations yet",
      text: "When visitors start chatting, they’ll appear here."
    };
  }
  if (filter === "mine") {
    return {
      title: "Nothing assigned to you",
      text: "Conversations assigned to you will show up here."
    };
  }
  if (filter === "open") {
    return {
      title: "No open conversations",
      text: "New or reopened conversations will appear here."
    };
  }
  return {
    title: "No conversations in this view",
    text: "Try a different filter to see the rest of your inbox."
  };
}

export function InboxEmptyState({
  filter,
  hasAnyConversations,
  workspaceRole
}: {
  filter: InboxFilter;
  hasAnyConversations: boolean;
  workspaceRole: SessionUser["workspaceRole"];
}) {
  const copy = copyForState(filter, hasAnyConversations, workspaceRole);

  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{copy.title}</Text>
      <Text style={styles.emptyText}>{copy.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { paddingVertical: mobileTheme.spacing.xxxl, alignItems: "center" },
  emptyTitle: {
    ...mobileTheme.typography.body,
    color: mobileTheme.colors.slate600,
    fontWeight: "600",
    marginBottom: mobileTheme.spacing.xs
  },
  emptyText: {
    ...mobileTheme.typography.body,
    color: mobileTheme.colors.slate400,
    textAlign: "center"
  }
});
