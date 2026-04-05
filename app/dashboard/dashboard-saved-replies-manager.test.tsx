import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSavedRepliesManager } from "./dashboard-saved-replies-manager";

describe("saved replies manager", () => {
  it("renders inside the shared settings card with the create action in the header", () => {
    const html = renderToStaticMarkup(<DashboardSavedRepliesManager canManage />);

    expect(html).toContain("Workspace reply library");
    expect(html).toContain("Create reusable replies for common questions");
    expect(html).toContain("rounded-xl border border-slate-200 bg-white p-6 overflow-hidden");
    expect(html).toContain("border-t border-slate-200 px-6 py-5");
    expect(html).toContain("New reply");
  });

  it("shows the same shared settings card without the create action for read-only teammates", () => {
    const html = renderToStaticMarkup(<DashboardSavedRepliesManager canManage={false} />);

    expect(html).toContain("Workspace reply library");
    expect(html).toContain("rounded-xl border border-slate-200 bg-white p-6 overflow-hidden");
    expect(html).not.toContain("New reply");
  });
});
