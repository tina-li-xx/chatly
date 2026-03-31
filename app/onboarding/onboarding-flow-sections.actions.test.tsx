import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

function collectElements(node: ReactNode, predicate: (element: ReactElement) => boolean): ReactElement[] {
  if (!node || typeof node === "string" || typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((child) => collectElements(child, predicate));
  const element = node as ReactElement;
  return [...(predicate(element) ? [element] : []), ...collectElements(element.props?.children, predicate)];
}

function textContent(node: ReactNode): string {
  if (!node || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  return textContent((node as ReactElement).props?.children);
}

async function loadLeftPanel() {
  vi.resetModules();
  const captures: Record<string, unknown> = { cards: [] };
  vi.doMock("next/link", () => ({ default: ({ children, ...props }: { children: ReactNode }) => <a {...props}>{children}</a> }));
  vi.doMock("../ui/form-controls", () => ({
    FormButton: ({
      children,
      fullWidth,
      trailingIcon,
      variant,
      size,
      ...props
    }: {
      children: ReactNode;
      fullWidth?: boolean;
      trailingIcon?: ReactNode;
      variant?: string;
      size?: string;
    }) => <button {...props}>{children}{trailingIcon}</button>,
    FormErrorMessage: ({ message }: { message: string | null }) => <div>{message}</div>,
    FormTextField: ({ label, onChange, value, ...props }: { label: string; value?: string; onChange?: (value: string) => void }) => (
      <label>
        {label}
        <input {...props} aria-label={label} value={value} onChange={(event) => onChange?.((event.target as HTMLInputElement).value)} />
      </label>
    )
  }));
  vi.doMock("./onboarding-flow-ui", () => ({
    InstallSnippetBlock: (props: unknown) => ((captures.snippet = props), <div>snippet</div>),
    SuccessActionCard: (props: unknown) => ((captures.cards as unknown[]).push(props), <button onClick={(props as { onClick?: () => void }).onClick}>{(props as { title: string }).title}</button>),
    StepProgress: (props: unknown) => ((captures.progress = props), <div>progress</div>)
  }));

  const module = await import("./onboarding-flow-sections");
  return { OnboardingLeftPanel: module.OnboardingLeftPanel, captures };
}

describe("onboarding left panel actions", () => {
  it("wires customize-step controls through to the parent callbacks", async () => {
    const { OnboardingLeftPanel } = await loadLeftPanel();
    const handlers = {
      onBack: vi.fn(),
      onDomainChange: vi.fn(),
      onWidgetTitleChange: vi.fn(),
      onBrandColorInputChange: vi.fn(),
      onBrandColorPickerChange: vi.fn(),
      onBrandColorInputBlur: vi.fn(),
      onAvatarStyleChange: vi.fn(),
      onLauncherPositionChange: vi.fn(),
      onShowOnlineStatusToggle: vi.fn(),
      onResponseTimeModeChange: vi.fn(),
      onCustomizeContinue: vi.fn(),
      onInstallTabChange: vi.fn(),
      onCopyCode: vi.fn(),
      onVerifyInstallation: vi.fn(),
      onSkipInstall: vi.fn(),
      onCompleteAndGo: vi.fn()
    };
    const tree = OnboardingLeftPanel({
      activeStep: "customize",
      stepIndex: 0,
      showRightPanel: true,
      showInstallSuccess: false,
      siteDraft: { id: "site_1", name: "Docs", widgetTitle: "Talk to us", brandColor: "#2563EB", avatarStyle: "initials", launcherPosition: "right", showOnlineStatus: true, responseTimeMode: "instant", teamPhotoUrl: "photo.png" } as never,
      domain: "",
      hasSavedDomain: false,
      brandColorInput: "2563EB",
      customizeError: "Fix me",
      customizeSaving: false,
      installTab: "code",
      copiedCode: false,
      installSnippet: "<script />",
      showVerificationSummary: false,
      verifying: false,
      verificationState: "idle",
      verificationMessage: null,
      verifiedSiteUrl: null,
      verifiedSiteHref: null,
      ...handlers
    });

    renderToStaticMarkup(tree);
    const fieldControls = collectElements(
      tree,
      (element) => typeof element.type === "function" && typeof element.props.onChange === "function"
    );
    const inputs = collectElements(tree, (element) => element.type === "input");
    fieldControls.find((element) => element.props.label === "Website URL")?.props.onChange("https://docs.example.com");
    fieldControls.find((element) => element.props.label === "Widget title")?.props.onChange("Say hello");
    inputs.find((element) => element.props["aria-label"] === "Brand color hex")?.props.onChange({ target: { value: "00FF00" } });
    inputs.find((element) => element.props["aria-label"] === "Brand color hex")?.props.onBlur();
    inputs.find((element) => element.props["aria-label"] === "Pick brand color")?.props.onChange({ target: { value: "#111111" } });
    collectElements(tree, (element) => element.type === "select")[0]?.props.onChange({ target: { value: "same_day" } });

    const clickables = collectElements(tree, (element) => typeof element.props?.onClick === "function");
    clickables.find((element) => textContent(element.props.children) === "Photo")?.props.onClick();
    clickables.find((element) => textContent(element.props.children) === "Bottom left")?.props.onClick();
    clickables.find((element) => element.props["aria-pressed"] === true)?.props.onClick();
    clickables.find((element) => textContent(element.props.children).includes("Continue"))?.props.onClick();

    expect(renderToStaticMarkup(tree)).toContain("Fix me");
    expect(handlers.onDomainChange).toHaveBeenCalledWith("https://docs.example.com");
    expect(handlers.onWidgetTitleChange).toHaveBeenCalledWith("Say hello");
    expect(handlers.onBrandColorInputChange).toHaveBeenCalledWith("00FF00");
    expect(handlers.onBrandColorPickerChange).toHaveBeenCalledWith("#111111");
    expect(handlers.onBrandColorInputBlur).toHaveBeenCalled();
    expect(handlers.onAvatarStyleChange).toHaveBeenCalledWith("photos");
    expect(handlers.onLauncherPositionChange).toHaveBeenCalledWith("left");
    expect(handlers.onShowOnlineStatusToggle).toHaveBeenCalled();
    expect(handlers.onResponseTimeModeChange).toHaveBeenCalledWith("same_day");
    expect(handlers.onCustomizeContinue).toHaveBeenCalled();
  });

  it("wires install-step tabs, verification controls, back button, and success actions", async () => {
    const { OnboardingLeftPanel, captures } = await loadLeftPanel();
    const handlers = {
      onBack: vi.fn(),
      onDomainChange: vi.fn(),
      onWidgetTitleChange: vi.fn(),
      onBrandColorInputChange: vi.fn(),
      onBrandColorPickerChange: vi.fn(),
      onBrandColorInputBlur: vi.fn(),
      onAvatarStyleChange: vi.fn(),
      onLauncherPositionChange: vi.fn(),
      onShowOnlineStatusToggle: vi.fn(),
      onResponseTimeModeChange: vi.fn(),
      onCustomizeContinue: vi.fn(),
      onInstallTabChange: vi.fn(),
      onCopyCode: vi.fn(),
      onVerifyInstallation: vi.fn(),
      onSkipInstall: vi.fn(),
      onCompleteAndGo: vi.fn()
    };
    let tree = OnboardingLeftPanel({
      activeStep: "install",
      stepIndex: 1,
      showRightPanel: false,
      showInstallSuccess: false,
      siteDraft: { conversationCount: 2 } as never,
      domain: "docs.example.com",
      hasSavedDomain: true,
      brandColorInput: "2563EB",
      customizeError: null,
      customizeSaving: false,
      installTab: "code",
      copiedCode: false,
      installSnippet: "<script />",
      showVerificationSummary: true,
      verifying: false,
      verificationState: "error",
      verificationMessage: "Not found",
      verifiedSiteUrl: null,
      verifiedSiteHref: null,
      ...handlers
    });

    renderToStaticMarkup(tree);
    const clickables = collectElements(tree, (element) => typeof element.props?.onClick === "function");
    clickables.find((element) => textContent(element.props.children).includes("Back"))?.props.onClick();
    clickables.find((element) => textContent(element.props.children) === "Next.js")?.props.onClick();
    (captures.snippet as { onCopy: () => void }).onCopy();
    clickables.find((element) => textContent(element.props.children).includes("Check"))?.props.onClick();
    clickables.find((element) => textContent(element.props.children).includes("Skip"))?.props.onClick();

    tree = OnboardingLeftPanel({
      activeStep: "install",
      stepIndex: 1,
      showRightPanel: true,
      showInstallSuccess: true,
      siteDraft: { conversationCount: 2 } as never,
      domain: "docs.example.com",
      hasSavedDomain: true,
      brandColorInput: "2563EB",
      customizeError: null,
      customizeSaving: false,
      installTab: "code",
      copiedCode: false,
      installSnippet: "<script />",
      showVerificationSummary: false,
      verifying: false,
      verificationState: "verified",
      verificationMessage: null,
      verifiedSiteUrl: "docs.example.com",
      verifiedSiteHref: "https://docs.example.com",
      ...handlers
    });
    renderToStaticMarkup(tree);
    (captures.cards as Array<{ title: string; onClick?: () => void }>).find((card) => card.title === "Customize more")?.onClick?.();
    collectElements(tree, (element) => typeof element.props?.onClick === "function").find((element) => textContent(element.props.children).includes("Go to Inbox"))?.props.onClick();

    expect(handlers.onBack).toHaveBeenCalled();
    expect(handlers.onInstallTabChange).toHaveBeenCalledWith("nextjs");
    expect(handlers.onCopyCode).toHaveBeenCalled();
    expect(handlers.onVerifyInstallation).toHaveBeenCalled();
    expect(handlers.onSkipInstall).toHaveBeenCalled();
    expect(handlers.onCompleteAndGo).toHaveBeenCalledWith("/dashboard/widget");
    expect(handlers.onCompleteAndGo).toHaveBeenCalledWith("/dashboard/inbox");
  });
});
