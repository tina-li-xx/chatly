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

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("@/lib/conversation-feedback", () => ({ buildConversationFeedbackLinks: vi.fn(() => ({ good: "#" })) }));
  vi.doMock("@/lib/conversation-transcript-email", () => ({
    buildConversationTranscriptPreviewMessages: vi.fn(() => []),
    renderConversationTranscriptEmailTemplate: vi.fn(() => ({ subject: "Transcript preview", bodyHtml: "<p>Transcript</p>" }))
  }));
  vi.doMock("@/lib/conversation-visitor-email", () => ({
    renderVisitorConversationEmailTemplate: vi.fn(() => ({ subject: "Visitor preview", bodyHtml: "<p>Visitor</p>" }))
  }));
  vi.doMock("./settings-email-template-ui", () => ({
    replaceTemplate: (templates: Array<{ key: string }>, nextTemplate: { key: string }) =>
      templates.map((template) => (template.key === nextTemplate.key ? nextTemplate : template)),
    SettingsEmailTemplateList: (props: unknown) => ((captures.list = props), <div>list</div>),
    SettingsEmailTemplateEditor: (props: unknown) => ((captures.editor = props), <div>editor</div>)
  }));

  const module = await import("./settings-email-templates");
  return { SettingsEmailTemplates: module.SettingsEmailTemplates, reactMocks, captures };
}

describe("settings email templates container", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("opens, edits, inserts content, saves, and resets templates", async () => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => callback(0),
      location: { origin: "https://app.usechatting.com" }
    });

    const { SettingsEmailTemplates, reactMocks, captures } = await loadSettingsEmailTemplates();
    const onChange = vi.fn();
    const templates = getDefaultDashboardEmailTemplates();

    reactMocks.beginRender();
    renderToStaticMarkup(
      SettingsEmailTemplates({
        templates,
        notificationEmail: "team@example.com",
        replyToEmail: "reply@example.com",
        profileEmail: "team@example.com",
        profileName: "Chatting",
        profileAvatarDataUrl: null,
        showTranscriptBrandingPreview: true,
        onChange,
        onNotice: vi.fn()
      })
    );
    await runMockEffects(reactMocks.effects);

    (captures.list as { onOpenTemplateEditor: (template: (typeof templates)[0]) => void }).onOpenTemplateEditor(templates[0]);
    reactMocks.beginRender();
    renderToStaticMarkup(
      SettingsEmailTemplates({
        templates,
        notificationEmail: "team@example.com",
        replyToEmail: "reply@example.com",
        profileEmail: "team@example.com",
        profileName: "Chatting",
        profileAvatarDataUrl: null,
        showTranscriptBrandingPreview: true,
        onChange,
        onNotice: vi.fn()
      })
    );

    const editor = captures.editor as {
      editingTemplate: { body: string; subject: string };
      textareaRef: { current: null | { selectionStart: number; selectionEnd: number; focus: () => void; setSelectionRange: (a: number, b: number) => void } };
      onUpdateField: (key: "subject", value: string) => void;
      onInsertVariable: (token: string) => void;
      onSave: () => void;
    };
    editor.textareaRef.current = {
      selectionStart: 0,
      selectionEnd: 0,
      focus: vi.fn(),
      setSelectionRange: vi.fn()
    };
    editor.onUpdateField("subject", "Custom subject");
    editor.onInsertVariable("{{team_name}}");

    reactMocks.beginRender();
    renderToStaticMarkup(
      SettingsEmailTemplates({
        templates,
        notificationEmail: "team@example.com",
        replyToEmail: "reply@example.com",
        profileEmail: "team@example.com",
        profileName: "Chatting",
        profileAvatarDataUrl: null,
        showTranscriptBrandingPreview: true,
        onChange,
        onNotice: vi.fn()
      })
    );

    expect((captures.editor as { editingTemplate: { subject: string; body: string } }).editingTemplate.subject).toBe("Custom subject");
    expect((captures.editor as { editingTemplate: { subject: string; body: string } }).editingTemplate.body.startsWith("{{team_name}}")).toBe(true);

    (captures.editor as { onSave: () => void }).onSave();
    (captures.list as { onResetTemplate: (key: string) => void }).onResetTemplate("offline_reply");

    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0][0]?.subject).toBe(templates[0]?.subject);
  });

  it("toggles templates and sends test emails through success and failure paths", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "send-failed" }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => callback(0),
      location: { origin: "https://app.usechatting.com" }
    });

    const { SettingsEmailTemplates, reactMocks, captures } = await loadSettingsEmailTemplates();
    const onChange = vi.fn();
    const onNotice = vi.fn();
    const templates = getDefaultDashboardEmailTemplates();

    reactMocks.beginRender();
    renderToStaticMarkup(
      SettingsEmailTemplates({
        templates,
        notificationEmail: "team@example.com",
        replyToEmail: "reply@example.com",
        profileEmail: "team@example.com",
        profileName: "Chatting",
        profileAvatarDataUrl: null,
        showTranscriptBrandingPreview: false,
        onChange,
        onNotice
      })
    );

    (captures.list as { onToggleEnabled: (template: (typeof templates)[0]) => void }).onToggleEnabled(templates[1]);
    (captures.list as { onSendTest: (template: { key: string; subject: string; body: string }) => void }).onSendTest(templates[1]);
    expect(onNotice).toHaveBeenCalledWith({ tone: "success", message: "Sent a test email to team@example.com" });
    await flushAsyncWork();
    (captures.list as { onSendTest: (template: { key: string; subject: string; body: string }) => void }).onSendTest(templates[1]);
    expect(onNotice).toHaveBeenCalledWith({ tone: "success", message: "Sent a test email to team@example.com" });
    await flushAsyncWork();

    expect(onChange.mock.calls[0]?.[0][1]?.enabled).toBe(false);
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body)).toMatchObject({
      key: templates[1]?.key,
      notificationEmail: "team@example.com",
      replyToEmail: "reply@example.com"
    });
    expect(onNotice.mock.calls.filter(([notice]) => notice.message === "Sent a test email to team@example.com")).toHaveLength(2);
    expect(onNotice).toHaveBeenCalledWith({ tone: "error", message: "We couldn't send the test email just now." });
  });
});
