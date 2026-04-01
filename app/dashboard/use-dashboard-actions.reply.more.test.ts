const mocks = vi.hoisted(() => ({
  postDashboardForm: vi.fn()
}));

vi.mock("./dashboard-client.api", () => ({
  postDashboardForm: mocks.postDashboardForm
}));

import {
  createConversationSummary,
  createConversationThread,
  createDashboardActionsHarness
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
}

const originalFormData = globalThis.FormData;
const originalWindow = globalThis.window;

function createReplyEvent(content: string, attachments: File[] = []) {
  return {
    preventDefault: vi.fn(),
    currentTarget: {
      __formDataEntries: [["content", content], ...attachments.map((file) => ["attachments", file] as [string, File])],
      reset: vi.fn()
    }
  } as never;
}

describe("dashboard reply action edge cases", () => {
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
          createObjectURL: vi.fn(() => "blob:optimistic"),
          revokeObjectURL: vi.fn()
        }
      }
    });
  });

  afterAll(() => {
    globalThis.FormData = originalFormData;
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  });

  it("returns early when there is no active conversation", async () => {
    const clearTypingSignal = vi.fn();
    const setConversations = vi.fn();
    const setActiveConversation = vi.fn();
    const setSendingReply = vi.fn();
    const setAnsweredConversations = vi.fn();
    const setBanner = vi.fn();
    const showBanner = vi.fn();
    const recentOptimisticReplyAtRef = { current: new Map<string, number>() };
    const actions = createDashboardReplyActions({
      activeConversation: null,
      setConversations,
      setActiveConversation,
      setSendingReply,
      setAnsweredConversations,
      setBanner,
      recentOptimisticReplyAtRef,
      showBanner,
      clearTypingSignal
    });

    await actions.handleReplySend(createReplyEvent("Hello"));

    expect(mocks.postDashboardForm).not.toHaveBeenCalled();
    expect(clearTypingSignal).not.toHaveBeenCalled();
  });

  it("does not increment answered counts when a founder has already replied and email delivery is skipped", async () => {
    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_3",
        conversationId: "conv_1",
        sender: "founder",
        content: "Following up",
        createdAt: "2026-03-29T11:00:00.000Z",
        attachments: []
      },
      emailDelivery: "skipped"
    });
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({
        messages: [
          ...createConversationThread().messages,
          {
            id: "msg_2",
            conversationId: "conv_1",
            sender: "founder",
            content: "Earlier founder reply",
            createdAt: "2026-03-29T10:30:00.000Z",
            attachments: []
          }
        ]
      }),
      conversations: [createConversationSummary({ unreadCount: 2 })]
    });

    await harness.actions.handleReplySend(createReplyEvent("Following up"));

    expect(harness.answeredConversationsState.current).toBe(0);
    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Reply posted to the chat thread."
    });
  });

  it("handles attachment previews and failed email delivery copy", async () => {
    const file = new File(["hello"], "note.txt", { type: "text/plain" });
    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "founder",
        content: "Attachment sent",
        createdAt: "2026-03-29T11:15:00.000Z",
        attachments: [{ url: "https://cdn.example/note.txt", name: "note.txt" }]
      },
      emailDelivery: "failed"
    });
    const harness = createDashboardActionsHarness({
      conversations: [createConversationSummary({ unreadCount: 1 })]
    });

    await harness.actions.handleReplySend(createReplyEvent("Attachment sent", [file]));

    expect(globalThis.window.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(globalThis.window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:optimistic");
    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Reply posted to the chat thread. Email delivery failed."
    });
  });

  it("shows the retry banner when delivery is queued for another attempt", async () => {
    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "founder",
        content: "Queued retry",
        createdAt: "2026-03-29T11:20:00.000Z",
        attachments: []
      },
      emailDelivery: "queued_retry"
    });
    const harness = createDashboardActionsHarness({
      conversations: [createConversationSummary({ unreadCount: 1 })]
    });

    await harness.actions.handleReplySend(createReplyEvent("Queued retry"));

    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Reply posted to the chat thread. Email delivery queued to retry."
    });
  });
});
