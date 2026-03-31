import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  getPublicAppUrl: vi.fn(),
  script: vi.fn(),
  toastProvider: vi.fn()
}));

vi.mock("next/script", () => ({
  default: (props: Record<string, unknown>) => ((mocks.script(props), <script data-testid="analytics" />))
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: mocks.getPublicAppUrl }));
vi.mock("./ui/toast-provider", () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => ((mocks.toastProvider(children), <>{children}</>))
}));
vi.mock("./chatting-script", () => ({ default: () => <div>chatting-script</div> }));

describe("root layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the app hostname for analytics when the public url is external", async () => {
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com/dashboard");
    const RootLayout = (await import("./layout")).default;

    const html = renderToStaticMarkup(<RootLayout><div>child</div></RootLayout>);

    expect(html).toContain("chatting-script");
    expect(mocks.script).toHaveBeenCalledWith(expect.objectContaining({
      "data-domain": "usechatting.com",
      "data-website-id": "gm_25f962a050796abf194ae4f4"
    }));
  });

  it("falls back to the safe analytics domain for localhost and invalid urls", async () => {
    mocks.getPublicAppUrl.mockReturnValueOnce("http://localhost:3000").mockReturnValueOnce("");
    const RootLayout = (await import("./layout")).default;

    renderToStaticMarkup(<RootLayout><div>child</div></RootLayout>);
    renderToStaticMarkup(<RootLayout><div>child</div></RootLayout>);

    expect(mocks.script).toHaveBeenNthCalledWith(1, expect.objectContaining({ "data-domain": "your-site.com" }));
    expect(mocks.script).toHaveBeenNthCalledWith(2, expect.objectContaining({ "data-domain": "your-site.com" }));
  });
});
