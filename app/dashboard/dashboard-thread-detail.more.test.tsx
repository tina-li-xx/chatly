import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createConversationSummary, createConversationThread } from "./use-dashboard-actions.test-helpers";

vi.mock("./dashboard-thread-detail-sidebar", () => ({
  DashboardThreadDetailSidebar: ({ activeConversation }: { activeConversation: { id: string } }) => (
    <div>sidebar:{activeConversation.id}</div>
  )
}));

import { DashboardThreadDetail } from "./dashboard-thread-detail";

function collect(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collect(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collect(element.props?.children, predicate)];
}

function buttonByLabel(node: ReactNode, label: string) {
  return collect(
    node,
    (element) =>
      (element.type === "button" || typeof element.type === "function") &&
      (
        element.props["aria-label"] === label ||
        String(JSON.stringify(element.props.children ?? "")).includes(label)
      )
  )[0];
}

function getComposerTextarea(node: ReactNode) {
  return collect(
    node,
    (element) =>
      typeof element.props?.onFocus === "function" &&
      typeof element.props?.onInput === "function" &&
      typeof element.props?.onKeyDown === "function"
  )[0];
}

function baseProps() {
  return {
    loadingConversationSummary: null,
    savingEmail: false,
    sendingReply: false,
    updatingStatus: false,
    isVisitorTyping: false,
    isLiveDisconnected: false,
    teamName: "Chatting",
    teamInitials: "CH",
    aiAssistSettings: {
      replySuggestionsEnabled: true,
      conversationSummariesEnabled: true,
      rewriteAssistanceEnabled: true,
      suggestedTagsEnabled: true
    },
    onSaveConversationEmail: vi.fn(),
    onSendReply: vi.fn(),
    onRetryReply: vi.fn(),
    onConversationStatusChange: vi.fn().mockResolvedValue(undefined),
    onReplyComposerBlur: vi.fn(),
    onReplyComposerFocus: vi.fn(),
    onReplyComposerInput: vi.fn(),
    onToggleTag: vi.fn().mockResolvedValue(undefined),
    onBack: vi.fn(),
    onOpenSidebar: vi.fn(),
    onCloseSidebar: vi.fn()
  };
}

describe("dashboard thread detail more", () => {
  it("renders anonymous loading and active conversation branches", () => {
    const loadingHtml = renderToStaticMarkup(
      <DashboardThreadDetail
        {...baseProps()}
        activeConversation={null}
        loadingConversationSummary={createConversationSummary({ email: null })}
        showSidebarInline={false}
      />
    );
    const activeHtml = renderToStaticMarkup(
      <DashboardThreadDetail
        {...baseProps()}
        activeConversation={createConversationThread({
          email: null,
          status: "open",
          messages: [
            {
              id: "msg_1",
              conversationId: "conv_1",
              sender: "team",
              content: "Pending reply",
              createdAt: "2026-03-29T11:15:00.000Z",
              attachments: [],
              pending: true
            }
          ]
        })}
      />
    );

    expect(loadingHtml).toContain("Visitor");
    expect(loadingHtml).toContain("Anonymous visitor");
    expect(activeHtml).toContain("Resolve");
    expect(activeHtml).toContain("sidebar:conv_1");
    expect(activeHtml).toContain("Chatting ·");
    expect(activeHtml).not.toContain("Sending...");
  });

  it("renders inline retry affordances for failed team replies", () => {
    const html = renderToStaticMarkup(
      <DashboardThreadDetail
        {...baseProps()}
        activeConversation={createConversationThread({
          messages: [
            {
              id: "msg_1",
              conversationId: "conv_1",
              sender: "team",
              content: "Need another shot",
              createdAt: "2026-03-29T11:15:00.000Z",
              attachments: [],
              failed: true
            }
          ]
        })}
      />
    );

    expect(html).toContain("Didn&#x27;t send");
    expect(html).toContain("Retry");
  });

  it("wires drawer close handlers and ignores shift-enter submits", () => {
    const props = baseProps();
    const tree = DashboardThreadDetail({
      ...props,
      activeConversation: createConversationThread({ status: "open" }),
      showSidebarInline: false,
      showSidebarDrawer: true
    });
    const resolveButton = buttonByLabel(tree, "Resolve");
    const textarea = getComposerTextarea(tree);
    const overlay = collect(tree, (element) => element.type === "div" && element.props.onClick)[0];
    const closeButton = buttonByLabel(tree, "Close contact info");
    const requestSubmit = vi.fn();
    const preventDefault = vi.fn();

    resolveButton?.props.onClick();
    overlay?.props.onClick();
    closeButton?.props.onClick();
    const composer = collect(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.props?.onReplyComposerFocus === props.onReplyComposerFocus
    )[0];

    expect(props.onConversationStatusChange).toHaveBeenCalledWith("resolved");
    expect(props.onCloseSidebar).toHaveBeenCalledTimes(2);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(requestSubmit).not.toHaveBeenCalled();
    expect(composer?.props.onSendReply).toBe(props.onSendReply);
  });

  it("keeps the composer editable while a reply is sending", () => {
    const props = baseProps();
    const tree = DashboardThreadDetail({
      ...props,
      sendingReply: true,
      activeConversation: createConversationThread({ status: "open" }),
      showSidebarInline: false
    });
    const textarea = getComposerTextarea(tree);
    const composer = collect(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.props?.onReplyComposerFocus === props.onReplyComposerFocus
    )[0];

    expect(textarea?.props.disabled).toBeUndefined();
    expect(composer?.props.sendingReply).toBe(true);
  });
});
