const mocks = vi.hoisted(() => ({
  postDashboardForm: vi.fn()
}));

vi.mock("./dashboard-client.api", () => ({
  postDashboardForm: mocks.postDashboardForm
}));

import {
  createConversationSummary,
  createConversationThread
} from "./use-dashboard-actions.test-helpers";
import { createDashboardReplyActions } from "./use-dashboard-actions.reply";

class MockFormData {
  private readonly values = new Map<string, Array<string | File>>();

  constructor(form?: { __formDataEntries?: Array<[string, string | File]> }) {
    for (const [name, value] of form?.__formDataEntries ?? []) this.append(name, value);
  }

  append(name: string, value: string | File) {
    this.values.set(name, [...(this.values.get(name) ?? []), value]);
  }

  get(name: string) {
    return this.values.get(name)?.[0] ?? null;
  }

  getAll(name: string) {
    return this.values.get(name) ?? [];
  }

  set(name: string, value: string | File) {
    this.values.set(name, [value]);
  }
}

const originalFormData = globalThis.FormData;
const originalWindow = globalThis.window;

function createReplyEvent(entries: Array<[string, string | File]>) {
  return {
    preventDefault: vi.fn(),
    currentTarget: {
      __formDataEntries: entries,
      reset: vi.fn()
    }
  } as never;
}

function createReplyActions(overrides: Partial<Parameters<typeof createDashboardReplyActions>[0]> = {}) {
  return createDashboardReplyActions({
    activeConversation: createConversationThread(),
    setConversations: vi.fn(),
    setActiveConversation: vi.fn(),
    setSendingReply: vi.fn(),
    setAnsweredConversations: vi.fn(),
    setBanner: vi.fn(),
    conversationCacheRef: { current: new Map() },
    recentOptimisticReplyAtRef: { current: new Map<string, number>() },
    showBanner: vi.fn(),
    clearTypingSignal: vi.fn().mockResolvedValue(undefined),
    ...overrides
  });
}

describe("dashboard reply action branch coverage", () => {
  beforeAll(() => {
    globalThis.FormData = MockFormData as never;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        setTimeout: (callback: () => void) => {
          callback();
          return 0;
        },
        URL: {
          createObjectURL: vi.fn((file: File) => `blob:${file.name}`),
          revokeObjectURL: vi.fn()
        }
      }
    });
  });

  afterAll(() => {
    globalThis.FormData = originalFormData;
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("filters invalid attachments and handles a missing active state during optimistic success settlement", async () => {
    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "team",
        content: "Sent with files",
        createdAt: "2026-03-29T11:00:00.000Z",
        attachments: []
      },
      emailDelivery: "sent"
    });

    let settledConversation: unknown;
    let settledSummaries: Array<{ id: string; lastMessagePreview: string }> = [];
    const actions = createReplyActions({
      setActiveConversation: (value) => {
        settledConversation = typeof value === "function" ? value(null) : value;
      },
      setConversations: (value) => {
        settledSummaries =
          typeof value === "function"
            ? value([
                createConversationSummary({ id: "conv_1", unreadCount: 2 }),
                createConversationSummary({ id: "conv_2", lastMessagePreview: "Leave me alone" })
              ])
            : value;
      }
    });

    await actions.handleReplySend(
      createReplyEvent([
        ["content", "Sent with files"],
        ["attachments", "not-a-file"],
        ["attachments", new File([""], "empty.txt", { type: "text/plain" })],
        ["attachments", new File(["hello"], "note.txt", { type: "text/plain" })]
      ])
    );

    expect(settledConversation).toBeNull();
    expect(settledSummaries.map(({ id }) => id)).toEqual(["conv_1", "conv_2"]);
    expect(settledSummaries[0]?.lastMessagePreview).toBe("Sent with files");
    expect(settledSummaries[1]?.lastMessagePreview).toBe("Leave me alone");
    expect(globalThis.window.URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(globalThis.window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:note.txt");
  });

  it("keeps diverged summary timestamps untouched when a failed reply rolls back", async () => {
    mocks.postDashboardForm.mockRejectedValueOnce(new Error("Reply failed"));

    let rolledBackConversation: ReturnType<typeof createConversationThread> | null = null;
    let rolledBackSummaries: Array<ReturnType<typeof createConversationSummary>> = [];
    const actions = createReplyActions({
      activeConversation: createConversationThread({
        updatedAt: "2026-03-29T10:05:00.000Z",
        lastMessageAt: "2026-03-29T10:05:00.000Z",
        lastMessagePreview: "Need help with pricing"
      }),
      setActiveConversation: (value) => {
        rolledBackConversation =
          typeof value === "function"
            ? value(
                createConversationThread({
                  updatedAt: "2026-03-29T09:00:00.000Z",
                  lastMessageAt: "2026-03-29T09:01:00.000Z",
                  lastMessagePreview: "Already changed upstream"
                })
              )
            : value;
      },
      setConversations: (value) => {
        rolledBackSummaries =
          typeof value === "function"
            ? value([
                createConversationSummary({
                  id: "conv_1",
                  updatedAt: "2026-03-29T09:00:00.000Z",
                  lastMessageAt: "2026-03-29T09:01:00.000Z",
                  lastMessagePreview: "Already changed upstream"
                }),
                createConversationSummary({ id: "conv_2", lastMessagePreview: "Untouched sibling" })
              ])
            : value;
      }
    });

    await actions.handleReplySend(createReplyEvent([["content", "Will fail"]]));

    expect(rolledBackConversation).toMatchObject({
      updatedAt: "2026-03-29T09:00:00.000Z",
      lastMessageAt: "2026-03-29T09:01:00.000Z",
      lastMessagePreview: "Already changed upstream"
    });
    expect(rolledBackSummaries.find((summary) => summary.id === "conv_1")).toMatchObject({
      id: "conv_1",
      updatedAt: "2026-03-29T09:00:00.000Z",
      lastMessageAt: "2026-03-29T09:01:00.000Z",
      lastMessagePreview: "Already changed upstream"
    });
    expect(rolledBackSummaries.find((summary) => summary.id === "conv_2")).toMatchObject({
      id: "conv_2",
      lastMessagePreview: "Untouched sibling"
    });
  });
});
