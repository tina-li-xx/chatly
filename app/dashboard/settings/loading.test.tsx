import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SettingsLoading from "./loading";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams()
}));

describe("dashboard settings loading", () => {
  it("keeps the static settings chrome while only skeletonizing the content cards", () => {
    const html = renderToStaticMarkup(<SettingsLoading />);

    expect(html).toContain("lg:grid-cols-[220px_minmax(0,1fr)]");
    expect(html).toContain("Profile");
    expect(html).toContain("Personal info and preferences");
    expect(html).toContain("Notifications");
    expect(html).toContain("Alert preferences");
    expect(html).toContain("Manage your personal information and preferences");
    expect(html).toContain("rounded-xl border border-slate-200 bg-white p-6");
    expect(html).not.toContain("xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]");
  });
});
