import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";
import { getDefaultDashboardEmailTemplates } from "@/lib/email-templates";

async function flushAsyncWork() {
  for (let index = 0; index < 6; index += 1) await Promise.resolve();
}

async function loadSettingsEmailTemplates() {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const renderTranscript = vi.fn(() => ({ subject: "Transcript preview", bodyHtml: "<p>Transcript</p>" }));
  const renderVisitor = vi.fn(() => ({ subject: "Visitor preview", bodyHtml: "<p>Visitor</p>" }));

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("@/lib/conversation-feedback", () => ({ buildConversationFeedbackLinks: vi.fn(() => ({ good: "#" })) }));
  vi.doMock("@/lib/conversation-transcript-email", () => ({
    buildConversationTranscriptPreviewMessages: vi.fn(() => []),
    renderConversationTranscriptEmailTemplate: renderTranscript
  }));
  vi.doMock("@/lib/conversation-visitor-email", () => ({ renderVisitorConversationEmailTemplate: renderVisitor }));
  vi.doMock("./settings-email-template-ui", () => ({
    replaceTemplate: (templates: Array<{ key: string }>, nextTemplate: { key: string }) =>
      templates.map((template) => (template.key === nextTemplate.key ? nextTemplate : template)),
    SettingsEmailTemplateList: (props: unknown) => ((captures.list = props), <div>list</div>),
    SettingsEmailTemplateEditor: (props: unknown) => ((captures.editor = props), <div>editor</div>)
  }));

  const module = await import("./settings-email-templates");
  return { SettingsEmailTemplates: module.SettingsEmailTemplates, reactMocks, captures, renderTranscript, renderVisitor };
}

describe("settings email templates edge cases", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the server-side origin fallback when window is unavailable", async () => {
    const { SettingsEmailTemplates, reactMocks, captures, renderTranscript, renderVisitor } =
      await loadSettingsEmailTemplates();
    const templates = getDefaultDashboardEmailTemplates();
    const props = {
      templates,
      notificationEmail: "team@example.com",
      replyToEmail: "",
      profileEmail: "profile@example.com",
      profileName: "Tina Bauer",
      profileAvatarDataUrl: null,
      showTranscriptBrandingPreview: true,
      onChange: vi.fn(),
      onNotice: vi.fn()
    };

    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    (captures.list as { onOpenTemplateEditor: (template: (typeof templates)[0]) => void }).onOpenTemplateEditor(
      templates.find((template) => template.key === "conversation_transcript")!
    );
    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    expect(renderTranscript).toHaveBeenCalledWith(
      expect.objectContaining({ key: "conversation_transcript" }),
      expect.any(Object),
      expect.objectContaining({ appUrl: "https://chatly.example", replyToEmail: "profile@example.com" })
    );

    (captures.list as { onOpenTemplateEditor: (template: (typeof templates)[0]) => void }).onOpenTemplateEditor(
      templates.find((template) => template.key === "offline_reply")!
    );
    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    expect(renderVisitor).toHaveBeenCalledWith(
      expect.objectContaining({ key: "offline_reply" }),
      expect.any(Object),
      expect.objectContaining({ appUrl: "https://chatly.example", replyToEmail: "profile@example.com" })
    );
  });

  it("inserts placeholder text, closes on escape, and handles ok:false test payloads", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: false, error: "send-failed" })
    });
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener,
      requestAnimationFrame: (callback: FrameRequestCallback) => callback(0),
      location: { origin: "https://app.usechatting.com" }
    });

    const { SettingsEmailTemplates, reactMocks, captures } = await loadSettingsEmailTemplates();
    const onNotice = vi.fn();
    const templates = getDefaultDashboardEmailTemplates();
    const props = {
      templates,
      notificationEmail: "team@example.com",
      replyToEmail: "reply@example.com",
      profileEmail: "profile@example.com",
      profileName: "Tina Bauer",
      profileAvatarDataUrl: null,
      showTranscriptBrandingPreview: false,
      onChange: vi.fn(),
      onNotice
    };

    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));
    await runMockEffects(reactMocks.effects);
    (captures.list as { onToggleMenu: (key: string) => void }).onToggleMenu("offline_reply");
    (captures.list as { onOpenTemplateEditor: (template: (typeof templates)[0]) => void }).onOpenTemplateEditor(
      templates[0]
    );
    reactMocks.beginRender();
    renderToStaticMarkup(SettingsEmailTemplates(props));

    const editor = captures.editor as {
      editingTemplate: { body: string };
      onInsertIntoBody: (before: string, after?: string, placeholder?: string) => void;
      onSendTest: (template: { key: string; subject: string; body: string }) => void;
      textareaRef: { current: { selectionStart: number; selectionEnd: number; focus: () => void; setSelectionRange: (a: number, b: number) => void } | null };
    };
    editor.textareaRef.current = {
      selectionStart: 0,
      selectionEnd: 0,
      focus: vi.fn(),
      setSelectionRange: vi.fn()
    };
    editor.onInsertIntoBody("**", "**", "Placeholder");
    editor.onSendTest(templates[0]);
    expect(onNotice).toHaveBeenCalledWith({
      tone: "success",
      message: "Sent a test email to team@example.com"
    });
    await flushAsyncWork();

    reactMocks.beginRender();
    captures.editor = null;
    renderToStaticMarkup(SettingsEmailTemplates(props));
    expect((captures.editor as { editingTemplate: { body: string } }).editingTemplate.body.startsWith("**Placeholder**")).toBe(true);

    const keydown = addEventListener.mock.calls.find(([event]) => event === "keydown")?.[1] as
      | ((event: KeyboardEvent) => void)
      | undefined;
    keydown?.({ key: "Escape" } as KeyboardEvent);
    reactMocks.beginRender();
    captures.editor = null;
    renderToStaticMarkup(SettingsEmailTemplates(props));

    expect(captures.editor).toBeNull();
    expect((captures.list as { menuTemplateKey: string | null }).menuTemplateKey).toBeNull();
    expect(onNotice).toHaveBeenCalledWith({
      tone: "error",
      message: "We couldn't send the test email just now."
    });
  });
});
