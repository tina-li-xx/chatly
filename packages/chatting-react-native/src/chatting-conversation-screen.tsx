import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useChattingConversation } from "./use-chatting-conversation";
import { styles } from "./chatting-screen-styles";
import type { ChattingClient } from "./chatting-client";
import type { ChattingVisitorContext, ChattingVisitorProfile } from "./chatting-types";

export function ChattingConversationScreen(input: {
  client: ChattingClient;
  context?: ChattingVisitorContext;
  profile?: ChattingVisitorProfile | null;
  draftVisitorEmail?: string | null;
  pollIntervalMs?: number;
}) {
  const conversation = useChattingConversation(input);
  const title = conversation.siteConfig?.widgetTitle ?? "Chatting";
  const subtitle =
    conversation.siteConfig?.showOnlineStatus !== false && conversation.siteStatus
      ? conversation.siteStatus.online
        ? "Team is online"
        : "Team is away"
      : conversation.siteConfig?.greetingText ?? "Start a conversation";

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {conversation.errorMessage ? (
          <View style={styles.banner}>
            <Text style={[styles.bannerText, styles.error]}>{conversation.errorMessage}</Text>
          </View>
        ) : null}

        {conversation.isLoading ? <ActivityIndicator color="#2563EB" /> : null}

        {!conversation.isLoading && conversation.messages.length === 0 ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Open support inside your app without rebuilding visitor chat from scratch.</Text>
          </View>
        ) : null}

        {conversation.messages.map((message) => (
          <View key={message.id} style={styles.row}>
            {message.sender === "team" ? (
              <>
                <Bubble message={message.content || "(attachment placeholder)"} isUser={false} />
                <View style={styles.spacer} />
              </>
            ) : (
              <>
                <View style={styles.spacer} />
                <Bubble message={message.content || "(attachment placeholder)"} isUser />
              </>
            )}
          </View>
        ))}

        {conversation.teamTyping ? (
          <View style={styles.row}>
            <Bubble message="Team is typing..." isUser={false} subtle />
            <View style={styles.spacer} />
          </View>
        ) : null}

        {conversation.faqSuggestions?.items.map((item) => (
          <View key={item.id} style={styles.faqCard}>
            <Text style={styles.faqTitle}>{item.question}</Text>
            <Text style={styles.faqText}>{item.answer}</Text>
          </View>
        ))}

        {conversation.faqSuggestions?.fallbackMessage ? (
          <Text style={styles.meta}>{conversation.faqSuggestions.fallbackMessage}</Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TextInput
          value={conversation.emailAddress}
          onChangeText={conversation.setEmailAddress}
          placeholder="Email for follow-up"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          value={conversation.draftMessage}
          onChangeText={conversation.setDraftMessage}
          placeholder="Type a message"
          multiline
          style={[styles.input, styles.composer]}
        />
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => void conversation.saveEmail()}>
            <Text style={styles.secondaryButtonText}>{conversation.isSavingEmail ? "Saving..." : "Save email"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => void conversation.sendMessage()}>
            <Text style={styles.buttonText}>{conversation.isSending ? "Sending..." : "Send"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Bubble(input: { message: string; isUser: boolean; subtle?: boolean }) {
  return (
    <View
      style={[
        styles.bubble,
        input.isUser ? styles.userBubble : styles.teamBubble,
        input.subtle ? styles.typingBubble : null
      ]}
    >
      <Text style={input.isUser ? styles.userText : styles.teamText}>{input.message}</Text>
    </View>
  );
}
