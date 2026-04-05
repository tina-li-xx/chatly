import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  toastProvider: vi.fn()
}));

vi.mock("./ui/toast-provider", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => ((mocks.toastProvider(children), <>{children}</>))
}));
vi.mock("./chatting-script", () => ({ default: () => <div>chatting-script</div> }));
vi.mock("./clarity-script", () => ({ default: () => <div>clarity-script</div> }));
vi.mock("./grometrics-script", () => ({ default: () => <div>grometrics-script</div> }));

describe("root layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the app shell scripts inside the toast provider", async () => {
    const RootLayout = (await import("./layout")).default;

    const html = renderToStaticMarkup(<RootLayout><div>child</div></RootLayout>);

    expect(html).toContain("chatting-script");
    expect(html).toContain("clarity-script");
    expect(html).toContain("grometrics-script");
    expect(html).toContain("child");
    expect(mocks.toastProvider).toHaveBeenCalledWith(expect.anything());
  });
});
