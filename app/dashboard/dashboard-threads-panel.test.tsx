import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createConversationSummary } from "./use-dashboard-actions.test-helpers";
import { createMockReactHooks } from "./test-react-hooks";

vi.mock("./dashboard-shell", () => ({
  DashboardLink: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

import { DashboardThreadsPanel } from "./dashboard-threads-panel";

const TEAM_MEMBERS = [
  {
    id: "user_1",
    name: "Tina",
    email: "tina@example.com",
    initials: "TI",
    role: "owner" as const,
    status: "online" as const,
    lastActiveLabel: "Now",
    isCurrentUser: true,
    avatarDataUrl: null
  },
  {
    id: "user_2",
    name: "Marcus",
    email: "marcus@example.com",
    initials: "MA",
    role: "member" as const,
    status: "offline" as const,
    lastActiveLabel: "5m ago",
    isCurrentUser: false,
    avatarDataUrl: null
  }
];

const MEMBER_TEAM_MEMBERS = [
  {
    id: "user_1",
    name: "Tina",
    email: "tina@example.com",
    initials: "TI",
    role: "member" as const,
    status: "online" as const,
    lastActiveLabel: "Now",
    isCurrentUser: true,
    avatarDataUrl: null
  },
  {
    id: "user_2",
    name: "Marcus",
    email: "marcus@example.com",
    initials: "MA",
    role: "admin" as const,
    status: "offline" as const,
    lastActiveLabel: "5m ago",
    isCurrentUser: false,
    avatarDataUrl: null
  }
];

async function loadThreadsPanel() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("./dashboard-shell", () => ({
    DashboardLink: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }));

  const module = await import("./dashboard-threads-panel");
  return { DashboardThreadsPanel: module.DashboardThreadsPanel, reactMocks };
}

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

function textOf(node: ReactNode): string {
  if (!node || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textOf).join(" ");
  }
  return textOf((node as ReactElement).props?.children);
}

describe("dashboard threads panel", () => {
  it("renders the install and empty-search states", () => {
    const emptyHtml = renderToStaticMarkup(
      <DashboardThreadsPanel
        allConversations={[]}
        conversations={[]}
        initialWidgetInstalled={false}
        widgetSiteIds={["site_1"]}
        threadFilter="all"
        assignmentFilter="all"
        searchQuery=""
        onThreadFilterChange={vi.fn()}
        onAssignmentFilterChange={vi.fn()}
        onSearchQueryChange={vi.fn()}
      />
    );
    const installedEmptyHtml = renderToStaticMarkup(
      <DashboardThreadsPanel
        allConversations={[]}
        conversations={[]}
        initialWidgetInstalled
        widgetSiteIds={["site_1"]}
        threadFilter="all"
        assignmentFilter="all"
        searchQuery=""
        onThreadFilterChange={vi.fn()}
        onAssignmentFilterChange={vi.fn()}
        onSearchQueryChange={vi.fn()}
      />
    );
    const searchHtml = renderToStaticMarkup(
      <DashboardThreadsPanel
        allConversations={[createConversationSummary()]}
        conversations={[]}
        initialWidgetInstalled={false}
        widgetSiteIds={["site_1"]}
        threadFilter="open"
        assignmentFilter="unassigned"
        searchQuery="pricing"
        onThreadFilterChange={vi.fn()}
        onAssignmentFilterChange={vi.fn()}
        onSearchQueryChange={vi.fn()}
      />
    );

    expect(emptyHtml).toContain("No conversations yet");
    expect(emptyHtml).toContain("Install widget");
    expect(installedEmptyHtml).not.toContain("Install widget");
    expect(searchHtml).toContain("No conversations found");
    expect(searchHtml).toContain("Showing 0 of 1 conversations");
  });

  it("hides the assignment filter for member workspaces", () => {
    const html = renderToStaticMarkup(
      <DashboardThreadsPanel
        allConversations={[createConversationSummary()]}
        conversations={[createConversationSummary()]}
        initialWidgetInstalled={false}
        widgetSiteIds={["site_1"]}
        teamMembers={MEMBER_TEAM_MEMBERS}
        threadFilter="all"
        assignmentFilter="all"
        searchQuery=""
        onThreadFilterChange={vi.fn()}
        onAssignmentFilterChange={vi.fn()}
        onSearchQueryChange={vi.fn()}
      />
    );

    expect(html).not.toContain("Assignment");
    expect(html).not.toContain("All assignments");
  });

  it("renders active, unread, and resolved threads with search footer counts", () => {
    const html = renderToStaticMarkup(
      <DashboardThreadsPanel
        allConversations={[
          createConversationSummary({ unreadCount: 2 }),
          createConversationSummary({ id: "conv_2", status: "resolved", unreadCount: 0, email: null })
        ]}
        conversations={[
          createConversationSummary({ unreadCount: 2 }),
          createConversationSummary({ id: "conv_2", status: "resolved", unreadCount: 0, email: null })
        ]}
        initialWidgetInstalled={false}
        widgetSiteIds={["site_1"]}
        activeConversationId="conv_1"
        highlightedConversationId="conv_2"
        threadFilter="resolved"
        assignmentFilter="assignedToTeammate"
        searchQuery="pricing"
        onThreadFilterChange={vi.fn()}
        onAssignmentFilterChange={vi.fn()}
        onSearchQueryChange={vi.fn()}
      />
    );

    expect(html).toContain("Showing 2 of 2 conversations");
    expect(html).toContain("Need help with pricing");
    expect(html).toContain("Main site");
    expect(html).not.toContain("/pricing");
  });

  it("forwards filter, search, clear, and select handlers", async () => {
    const onThreadFilterChange = vi.fn();
    const onAssignmentFilterChange = vi.fn();
    const onSearchQueryChange = vi.fn();
    const onClearSearch = vi.fn();
    const onSelectConversation = vi.fn();
    const { DashboardThreadsPanel, reactMocks } = await loadThreadsPanel();
    reactMocks.beginRender();
    const tree = DashboardThreadsPanel({
      allConversations: [createConversationSummary(), createConversationSummary({ id: "conv_2" })],
      conversations: [createConversationSummary(), createConversationSummary({ id: "conv_2" })],
      initialWidgetInstalled: false,
      widgetSiteIds: ["site_1"],
      teamMembers: TEAM_MEMBERS,
      activeConversationId: "conv_1",
      highlightedConversationId: "conv_2",
      threadFilter: "all",
      assignmentFilter: "all",
      searchQuery: "pricing",
      searchInputId: "search",
      onThreadFilterChange,
      onAssignmentFilterChange,
      onSearchQueryChange,
      onClearSearch,
      onSelectConversation
    });

    const buttons = collectElements(tree, (element) => element.type === "button");
    const input = collectElements(tree, (element) => element.type === "input")[0];
    const links = collectElements(
      tree,
      (element) => typeof element.type === "function" && typeof element.props.onClick === "function"
    );
    const preventDefault = vi.fn();

    buttons[1]?.props.onClick();
    const selects = collectElements(tree, (element) => element.type === "select");
    selects[0]?.props.onChange({ currentTarget: { value: "mine" } });
    input?.props.onChange({ currentTarget: { value: "vip" } });
    buttons.at(-1)?.props.onClick();
    links[0]?.props.onClick({
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      button: 0,
      preventDefault
    });

    expect(onThreadFilterChange).toHaveBeenCalledWith("open");
    expect(onAssignmentFilterChange).toHaveBeenCalledWith("mine");
    expect(onSearchQueryChange).toHaveBeenCalledWith("vip");
    expect(onClearSearch).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
    expect(onSelectConversation).toHaveBeenCalledWith("conv_1");
    expect(textOf(links[0]?.props.children)).toContain("Need help with pricing");
  });
});
