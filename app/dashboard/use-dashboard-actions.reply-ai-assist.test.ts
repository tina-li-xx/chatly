const mocks = vi.hoisted(() => ({
  postDashboardForm: vi.fn(),
  trackDashboardAiAssistEvent: vi.fn(),
  trackGrometricsEvent: vi.fn()
}));

vi.mock("./dashboard-client.api", () => ({
  postDashboardForm: mocks.postDashboardForm
}));
vi.mock("./dashboard-ai-assist-events", () => ({
  trackDashboardAiAssistEvent: mocks.trackDashboardAiAssistEvent
}));
vi.mock("@/lib/grometrics", () => ({
  trackGrometricsEvent: mocks.trackGrometricsEvent
}));

import {
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

function createReplyEvent(content: string, aiAssistReplyDraft?: string) {
  return {
    preventDefault: vi.fn(),
    currentTarget: {
      __formDataEntries: [
        ["content", content],
        ...(aiAssistReplyDraft ? [["aiAssistReplyDraft", aiAssistReplyDraft] as [string, string]] : [])
      ],
      reset: vi.fn()
    }
  } as never;
}

describe("dashboard ai reply usage tracking", () => {
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

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("logs ai reply usage without an edit level when the sent reply matches the draft", async () => {
    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "team",
        content: "Happy to help",
        createdAt: "2026-03-29T11:00:00.000Z",
        attachments: []
      },
      emailDelivery: "sent"
    });
    const harness = createDashboardActionsHarness();

    await harness.actions.handleReplySend(
      createReplyEvent("Happy to help", "Happy to help")
    );

    expect(mocks.trackDashboardAiAssistEvent).toHaveBeenCalledWith("ai.reply.used", {
      conversationId: "conv_1",
      edited: false
    });
  });

  it("preserves the reply edit level on retry after an initial send failure", async () => {
    mocks.postDashboardForm.mockRejectedValueOnce(new Error("Reply failed"));
    const harness = createDashboardActionsHarness();

    await harness.actions.handleReplySend(
      createReplyEvent(
        "Please book time with our team and we can walk you through the full pricing setup.",
        "Happy to help"
      )
    );

    const failedMessage = harness.activeConversationState.current?.messages[1];
    mocks.postDashboardForm.mockResolvedValueOnce({
      conversationId: "conv_1",
      message: {
        id: "msg_2",
        conversationId: "conv_1",
        sender: "team",
        content: "Please book time with our team and we can walk you through the full pricing setup.",
        createdAt: "2026-03-29T11:30:00.000Z",
        attachments: []
      },
      emailDelivery: "sent"
    });

    const retryActions = createDashboardReplyActions({
      activeConversation: harness.activeConversationState.current,
      setConversations: harness.conversationsState.set,
      setActiveConversation: harness.activeConversationState.set,
      setSendingReply: harness.sendingReplyState.set,
      setAnsweredConversations: harness.answeredConversationsState.set,
      setBanner: harness.bannerState.set,
      conversationCacheRef: harness.conversationCacheRef,
      recentOptimisticReplyAtRef: harness.recentOptimisticReplyAtRef,
      showBanner: harness.showBanner,
      clearTypingSignal: harness.clearTypingSignal
    } as never);

    await retryActions.handleReplyRetry(failedMessage?.id ?? "");

    expect(mocks.trackDashboardAiAssistEvent).toHaveBeenCalledWith("ai.reply.used", {
      conversationId: "conv_1",
      edited: true,
      editLevel: "heavy"
    });
  });
});
