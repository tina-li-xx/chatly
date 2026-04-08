import type { GuideArticle } from "@/lib/guide-article";
import { chattingInboxShortcutsGuideSections } from "@/lib/chatting-inbox-shortcuts-guide-sections";

export const chattingInboxShortcutsGuide: GuideArticle = {
  slug: "chatting-inbox-shortcuts",
  title: "Chatting inbox shortcuts: every keyboard shortcut and AI Assist command",
  excerpt:
    "A simple guide for teams who want to move faster in the inbox. See every built-in keyboard shortcut, AI Assist shortcut, and command palette action in one place.",
  subtitle:
    "Your team should not have to guess what the inbox can do. Here is the full shortcut list, plus the AI Assist commands that save the most time.",
  seoTitle: "Chatting Inbox Shortcuts Guide",
  publishedAt: "2026-04-06T09:00:00.000Z",
  updatedAt: "2026-04-06T09:00:00.000Z",
  readingTime: 5,
  image: {
    src: "/blog/chatting-inbox-shortcuts.svg",
    alt: "Chatting inbox artwork with keyboard keys, AI badges, and command palette cues."
  },
  sections: chattingInboxShortcutsGuideSections
};
