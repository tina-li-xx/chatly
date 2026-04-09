import { cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingInboxShortcutsGuideSections = [
  section("why", "Why this guide exists", [
    paragraph("Most teams learn one or two inbox shortcuts and never discover the rest. That means more clicking, slower triage, and AI Assist features that stay hidden even when they are already available."),
    paragraph("This guide gives your team one place to see the keyboard shortcuts and command palette actions that are already built into the Chatting inbox.")
  ]),
  section("keyboard-shortcuts", "Inbox keyboard shortcuts", [
    list([
      "`Ctrl/Cmd + K`: open the command palette",
      "`Ctrl/Cmd + /`: show keyboard shortcuts",
      "`Ctrl/Cmd + J`: suggest a reply for the active conversation",
      "`Ctrl/Cmd + Shift + S`: summarize the active conversation",
      "`Up / Down`: move through conversations in the inbox list",
      "`Enter`: open the selected conversation",
      "`Enter` in the reply box: send your message",
      "`Escape`: close overlays or clear the current selection",
      "`R`: mark the active conversation resolved or reopen it",
      "`N`: jump to search"
    ]),
    paragraph("The AI shortcuts only work when you already have a conversation open. If there is no active conversation, there is nothing to summarize or draft a reply for.")
  ]),
  section("ai-assist", "AI Assist shortcuts your team should know", [
    paragraph("The two most useful shortcuts for busy inboxes are the AI ones."),
    list([
      "`Ctrl/Cmd + J` opens Suggest reply so you can get a draft without leaving the keyboard",
      "`Ctrl/Cmd + Shift + S` opens Summarize conversation so you can catch up on a long thread quickly"
    ]),
    paragraph("These are especially helpful for handoffs, catching up after being away, and replying faster when the question is familiar but the wording still needs a human pass.")
  ]),
  section("command-palette", "What is in the command palette", [
    paragraph("Open the command palette with `Ctrl/Cmd + K` to get a searchable action menu inside the inbox."),
    list([
      "Focus search",
      "Show keyboard shortcuts",
      "Open widget settings",
      "Open visitors",
      "Open settings",
      "Suggest reply when AI reply is available",
      "Summarize conversation when AI summary is available",
      "Mark conversation resolved or reopen conversation"
    ]),
    paragraph("This is the fastest way to learn what is available without memorizing everything on day one.")
  ]),
  section("rollout", "A simple rollout for your team", [
    list([
      "Teach everyone `Ctrl/Cmd + K` on day one",
      "Teach support teammates `Ctrl/Cmd + J` and `Ctrl/Cmd + Shift + S` next",
      "Pin this guide in your internal onboarding notes",
      "Encourage teammates to use the shortcuts modal as the quick reference"
    ], true),
    cta(
      "Want the shortcuts inside the inbox too?",
      "Open the inbox and use `Ctrl/Cmd + /` to pull up the built-in keyboard shortcuts list.",
      "Open Chatting",
      "/login"
    )
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do these shortcuts work on Mac and Windows?",
        answer: "Yes. Use Cmd on Mac and Ctrl on Windows."
      },
      {
        question: "Will AI Assist shortcuts work for every teammate?",
        answer:
          "They work when AI Assist is available for that workspace and the teammate has an active conversation open."
      },
      {
        question: "Where can teammates discover this without guessing?",
        answer:
          "Inside the inbox, use `Ctrl/Cmd + /` to open the keyboard shortcuts modal and `Ctrl/Cmd + K` to browse actions in the command palette."
      }
    ])
  ])
];
