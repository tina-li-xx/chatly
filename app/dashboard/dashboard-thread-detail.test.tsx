import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createConversationSummary, createConversationThread } from "./use-dashboard-actions.test-helpers";

vi.mock("./dashboard-thread-detail-sidebar", () => ({
  DashboardThreadDetailSidebar: ({ activeConversation }: { activeConversation: { id: string } }) => (
    <div>sidebar:{activeConversation.id}</div>
  )
}));

import { DashboardThreadDetail } from "./dashboard-thread-detail";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => collectElements(child, predicate));
  }
  const element = node as ReactElement;
  return [
    ...(predicate(element) ? [element] : []),
    ...collectElements(element.props?.children, predicate)
  ];
}

function buttonByLabel(node: ReactNode, label: string) {
  return collectElements(
    node,
    (element) =>
      element.type === "button" &&
      (element.props["aria-label"] === label ||
        String(JSON.stringify(element.props.children ?? "")).includes(label))
  )[0];
}

function getComposerTextarea(node: ReactNode) {
  return collectElements(
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

describe("dashboard thread detail", () => {
  it("renders loading and empty states", () => {
    const loadingHtml = renderToStaticMarkup(
      <DashboardThreadDetail
        {...baseProps()}
        activeConversation={null}
        loadingConversationSummary={createConversationSummary({ email: "alex@example.com" })}
        showBackButton
      />
    );
    const emptyHtml = renderToStaticMarkup(
      <DashboardThreadDetail {...baseProps()} activeConversation={null} loadingConversationSummary={null} />
    );

    expect(loadingHtml).toContain("Loading conversation...");
    expect(loadingHtml).toContain("Loading visitor details...");
    expect(emptyHtml).toContain("Select a conversation");
    expect(emptyHtml).toContain("Visitor Info");
  });

  it("renders the active conversation timeline, status banner, and sidebars", () => {
    const html = renderToStaticMarkup(
      <DashboardThreadDetail
        {...baseProps()}
        activeConversation={createConversationThread({
          status: "resolved",
          messages: [
            {
              id: "msg_1",
              conversationId: "conv_1",
              sender: "user",
              content: "Need help with pricing",
              createdAt: "2026-03-28T10:00:00.000Z",
              attachments: []
            },
            {
              id: "msg_2",
              conversationId: "conv_1",
              sender: "team",
              content: "Happy to help",
              createdAt: "2026-03-29T11:15:00.000Z",
              attachments: []
            }
          ]
        })}
        loadingConversationSummary={null}
        isVisitorTyping
        isLiveDisconnected
        showSidebarDrawer
        showBackButton
        showSidebarInline={false}
      />
    );

    expect(html).toContain("Connection lost");
    expect(html).toContain("Visitor is typing...");
    expect(html).toContain("Happy to help");
    expect(html).toContain("Reopen");
    expect(html).toContain("Saved replies");
    expect(html).toContain("Suggest reply");
    expect(html).toContain("sidebar:conv_1");
    expect(html).toContain("Contact info");
  });

  it("wires reply and navigation handlers from the composed tree", () => {
    const props = baseProps();
    const tree = DashboardThreadDetail({
      ...props,
      activeConversation: createConversationThread(),
      showBackButton: true,
      showSidebarInline: false
    });

    const textarea = getComposerTextarea(tree);
    const form = collectElements(tree, (element) => element.type === "form")[0];
    const requestSubmit = vi.fn();
    const preventDefault = vi.fn();

    buttonByLabel(tree, "Back to conversations")?.props.onClick();
    buttonByLabel(tree, "Resolve")?.props.onClick();
    buttonByLabel(tree, "Open visitor info")?.props.onClick();
    textarea?.props.onFocus({ currentTarget: { value: "Hello" } });
    textarea?.props.onInput({ currentTarget: { value: "Hello again" } });
    textarea?.props.onBlur();
    textarea?.props.onKeyDown({ key: "Enter", shiftKey: false, preventDefault, currentTarget: { form: { requestSubmit } } });
    form?.props.onSubmit({ preventDefault: vi.fn() });

    expect(props.onBack).toHaveBeenCalled();
    expect(props.onConversationStatusChange).toHaveBeenCalledWith("resolved");
    expect(props.onOpenSidebar).toHaveBeenCalled();
    const composer = collectElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.props?.onReplyComposerFocus === props.onReplyComposerFocus
    )[0];

    expect(composer?.props.onReplyComposerFocus).toBe(props.onReplyComposerFocus);
    expect(composer?.props.onReplyComposerInput).toBe(props.onReplyComposerInput);
    expect(composer?.props.onReplyComposerBlur).toBe(props.onReplyComposerBlur);
    expect(composer?.props.onSendReply).toBe(props.onSendReply);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(requestSubmit).not.toHaveBeenCalled();
  });
});
