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

  set(name: string, value: string | File) {
    this.values.set(name, [value]);
  }
}

const originalFormData = globalThis.FormData;
const originalWindow = globalThis.window;

function createReplyEvent(content: string) {
  return {
    preventDefault: vi.fn(),
    currentTarget: {
      __formDataEntries: [["content", content]],
      reset: vi.fn()
    }
  } as never;
}

describe("dashboard reply action hotspots", () => {
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

  it("increments answered counts and shows the emailed banner when the first team reply succeeds", async () => {
    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "team",
        content: "Hello there",
        createdAt: "2026-03-29T11:00:00.000Z",
        attachments: []
      },
      emailDelivery: "sent"
    });
    const harness = createDashboardActionsHarness({
      conversations: [createConversationSummary({ unreadCount: 2 })]
    });

    await harness.actions.handleReplySend(createReplyEvent("Hello there"));

    expect(harness.answeredConversationsState.current).toBe(1);
    expect(harness.bannerState.current).toEqual({
      tone: "success",
      text: "Reply posted to the chat thread and emailed to the visitor."
    });
  });

  it("keeps the failed optimistic bubble while restoring the previous summary when posting fails", async () => {
    mocks.postDashboardForm.mockRejectedValueOnce(new Error("Reply failed"));
    const harness = createDashboardActionsHarness({
      activeConversation: createConversationThread({ lastMessagePreview: "Older message" }),
      conversations: [createConversationSummary({ unreadCount: 2, lastMessagePreview: "Older message" })]
    });

    await harness.actions.handleReplySend(createReplyEvent("Hello there"));

    expect(harness.activeConversationState.current?.messages[1]).toMatchObject({
      content: "Hello there",
      failed: true,
      pending: false
    });
    expect(harness.activeConversationState.current?.lastMessagePreview).toBe("Older message");
    expect(harness.bannerState.current).toEqual({
      tone: "error",
      text: "Reply failed"
    });
  });

  it("marks optimistic replies before the request settles and clears the marker on failure", async () => {
    let rejectReply!: (reason?: unknown) => void;
    mocks.postDashboardForm.mockReturnValueOnce(
      new Promise((_, reject) => {
        rejectReply = reject;
      })
    );
    const harness = createDashboardActionsHarness();

    const sendPromise = harness.actions.handleReplySend(createReplyEvent("Hello there"));

    expect(harness.recentOptimisticReplyAtRef.current.has("conv_1")).toBe(true);
    expect(harness.activeConversationState.current?.messages[1]).toMatchObject({
      content: "Hello there",
      pending: true
    });
    expect(harness.conversationCacheRef.current.get("conv_1")?.messages[1]).toMatchObject({
      content: "Hello there",
      pending: true
    });

    rejectReply(new Error("Reply failed"));
    await sendPromise;

    expect(harness.recentOptimisticReplyAtRef.current.has("conv_1")).toBe(false);
  });

  it("uses the generic banner when the reply failure is not an Error instance", async () => {
    mocks.postDashboardForm.mockRejectedValueOnce("boom");
    const clearTypingSignal = vi.fn().mockResolvedValue(undefined);
    const setConversations = vi.fn();
    const setActiveConversation = vi.fn();
    const setSendingReply = vi.fn();
    const setAnsweredConversations = vi.fn();
    const setBanner = vi.fn();
    const showBanner = vi.fn();
    const conversationCacheRef = { current: new Map() };
    const recentOptimisticReplyAtRef = { current: new Map<string, number>() };
    const actions = createDashboardReplyActions({
      activeConversation: createDashboardActionsHarness().activeConversationState.current,
      setConversations,
      setActiveConversation,
      setSendingReply,
      setAnsweredConversations,
      setBanner,
      conversationCacheRef,
      recentOptimisticReplyAtRef,
      showBanner,
      clearTypingSignal
    });

    await actions.handleReplySend(createReplyEvent("Hello there"));
    expect(showBanner).toHaveBeenCalledWith("error", "Reply could not be sent.");
  });
});
