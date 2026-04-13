import { type ReactNode, useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { listConversations } from "./api";
import { formatPersonName, friendlyErrorMessage } from "./formatting";
import { InboxChrome, type InboxFilter } from "./inbox-chrome";
import { InboxConversationCard } from "./inbox-conversation-card";
import { InboxEmptyState } from "./inbox-empty-state";
import { defaultInboxFilter, filterInboxConversations, normalizeInboxFilter } from "./inbox-filtering";
import { InboxSkeleton } from "./loading-skeletons";
import { sameConversationList } from "./mobile-data-equality";
import { mobileTheme } from "./mobile-theme";
import { useAutoRefresh } from "./use-auto-refresh";
import { useDashboardLive } from "./use-dashboard-live";
import type { ConversationSummary, MobileAvailability, MobileProfile, SessionUser } from "./types";

type InboxScreenProps = {
  availability: MobileAvailability;
  banner?: ReactNode;
  profile: MobileProfile;
  session: { baseUrl: string; token: string; user: SessionUser };
  onUnreadCountChange?(count: number): void;
  onOpenAccount(): void;
  onOpenConversation(conversationId: string): void;
  onToggleAvailability(next: MobileAvailability): Promise<void>;
};

export function InboxScreen({
  availability,
  banner,
  profile,
  session,
  onUnreadCountChange,
  onOpenAccount,
  onOpenConversation,
  onToggleAvailability
}: InboxScreenProps) {
  const workspaceRole = session.user.workspaceRole;
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>(defaultInboxFilter(workspaceRole));
  const [typingByConversation, setTypingByConversation] = useState<Record<string, boolean>>({});
  const load = useCallback(async (mode: "load" | "manual" | "silent" = "load") => {
    setError(null);
    if (mode === "load") {
      setLoading(true);
    }
    if (mode === "manual") {
      setRefreshing(true);
    }
    try {
      const next = await listConversations(session.baseUrl, session.token);
      setConversations((current) => (sameConversationList(current, next) ? current : next));
    } catch (nextError) {
      setError(nextError instanceof Error ? friendlyErrorMessage(nextError.message) : "Unable to load inbox.");
    } finally {
      setLoading(false);
      if (mode === "manual") {
        setRefreshing(false);
      }
    }
  }, [session.baseUrl, session.token]);

  useEffect(() => {
    void load();
  }, [load]);

  const { connectionState } = useDashboardLive({
    baseUrl: session.baseUrl,
    token: session.token,
    onError: () => void load("silent"),
    onMessage: (event) => {
      if (event.type === "connected") {
        return;
      }
      if (event.type === "typing.updated" && event.actor === "team") {
        setTypingByConversation((current) => {
          if (event.typing) {
            return { ...current, [event.conversationId]: true };
          }
          const next = { ...current };
          delete next[event.conversationId];
          return next;
        });
        return;
      }
      if (event.type === "message.created" && event.sender === "team") {
        setTypingByConversation((current) => {
          const next = { ...current };
          delete next[event.conversationId];
          return next;
        });
      }

      void load("silent");
    }
  });
  useAutoRefresh(() => {
    void load("silent");
  }, connectionState !== "connected");

  useEffect(() => {
    const next = normalizeInboxFilter(filter, workspaceRole);
    if (next !== filter) setFilter(next);
  }, [filter, workspaceRole]);

  const visible = filterInboxConversations(conversations, filter, session.user.id);
  const unreadCount = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [onUnreadCountChange, unreadCount]);

  async function handleToggleAvailability() {
    setUpdatingAvailability(true);
    try {
      await onToggleAvailability(availability === "online" ? "offline" : "online");
    } catch (nextError) {
      setError(nextError instanceof Error ? friendlyErrorMessage(nextError.message) : "Unable to update availability.");
    } finally {
      setUpdatingAvailability(false);
    }
  }

  const profileLabel = formatPersonName({ ...profile, email: profile.email || session.user.email });

  return (
    <View style={styles.screen}>
      <InboxChrome
        availability={availability}
        availabilityBusy={updatingAvailability}
        filter={filter}
        profileAvatarUrl={profile.avatarDataUrl}
        profileLabel={profileLabel}
        workspaceRole={workspaceRole}
        unreadCount={unreadCount}
        onChangeFilter={setFilter}
        onOpenAccount={onOpenAccount}
        onToggleAvailability={() => void handleToggleAvailability()}
      />
      {banner}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <InboxSkeleton />
      ) : (
        <FlatList
          style={styles.list}
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={visible.length ? styles.listContent : styles.emptyContent}
          refreshing={refreshing}
          onRefresh={() => void load("manual")}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <InboxConversationCard
              connectionState={connectionState}
              conversation={item}
              isTyping={Boolean(typingByConversation[item.id])}
              onPress={() => onOpenConversation(item.id)}
            />
          )}
          ListEmptyComponent={
            <InboxEmptyState
              filter={filter}
              hasAnyConversations={conversations.length > 0}
              workspaceRole={workspaceRole}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileTheme.colors.white, paddingTop: mobileTheme.spacing.lg },
  list: { flex: 1, backgroundColor: mobileTheme.colors.white },
  error: {
    marginHorizontal: mobileTheme.spacing.lg,
    marginTop: mobileTheme.spacing.md,
    padding: mobileTheme.spacing.md,
    borderRadius: mobileTheme.radius.lg,
    backgroundColor: mobileTheme.colors.errorSurface,
    color: mobileTheme.colors.red
  },
  listContent: { paddingVertical: mobileTheme.spacing.sm },
  emptyContent: {
    flexGrow: 1,
    paddingHorizontal: mobileTheme.spacing.lg,
    paddingVertical: mobileTheme.spacing.xxl,
    backgroundColor: mobileTheme.colors.white
  },
  separator: { height: 1, marginLeft: 68, backgroundColor: mobileTheme.colors.slate100 }
});
