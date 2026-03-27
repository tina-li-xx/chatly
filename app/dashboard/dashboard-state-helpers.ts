"use client";

import type { ConversationSummary, ConversationThread, ThreadMessage } from "@/lib/types";

export function toSummary(conversation: ConversationThread): ConversationSummary {
  const { messages: _messages, visitorActivity: _visitorActivity, ...summary } = conversation;
  return summary;
}

export function previewForMessage(message: ThreadMessage) {
  if (message.content.trim()) {
    return message.content;
  }

  if (message.attachments.length) {
    return message.attachments.length === 1
      ? `Shared ${message.attachments[0].fileName}`
      : `Shared ${message.attachments.length} files`;
  }

  return "No messages yet";
}

export function createOptimisticAttachmentUrls(files: File[]) {
  return files.map((file) => ({
    id: `optimistic-attachment-${crypto.randomUUID()}`,
    fileName: file.name || "Attachment",
    contentType: file.type || "application/octet-stream",
    sizeBytes: file.size || 0,
    url: window.URL.createObjectURL(file),
    isImage: (file.type || "").startsWith("image/")
  }));
}

export function revokeOptimisticAttachmentUrls(message: ThreadMessage) {
  window.setTimeout(() => {
    message.attachments.forEach((attachment) => {
      if (attachment.url.startsWith("blob:")) {
        window.URL.revokeObjectURL(attachment.url);
      }
    });
  }, 0);
}

export function removeMessageById(messages: ThreadMessage[], messageId: string) {
  return messages.filter((message) => message.id !== messageId);
}

export function nextTagsForToggle(tags: string[], tag: string) {
  return tags.includes(tag)
    ? tags.filter((entry) => entry !== tag)
    : [...tags, tag].sort((left, right) => left.localeCompare(right));
}

export function settleOptimisticMessage(
  messages: ThreadMessage[],
  optimisticId: string,
  nextMessage: ThreadMessage
) {
  let foundOptimistic = false;
  const settled = messages.map((message) => {
    if (message.id !== optimisticId) {
      return message;
    }

    foundOptimistic = true;
    return {
      ...message,
      pending: false
    };
  });

  if (foundOptimistic) {
    return settled;
  }

  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }

  return [...messages, nextMessage];
}
