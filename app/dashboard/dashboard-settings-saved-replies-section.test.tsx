import { renderToStaticMarkup } from "react-dom/server";

vi.mock("./dashboard-saved-replies-manager", () => ({
  DashboardSavedRepliesManager: ({ canManage }: { canManage: boolean }) => <div>manager:{String(canManage)}</div>
}));

import { SettingsSavedRepliesSection } from "./dashboard-settings-saved-replies-section";

describe("saved replies settings section", () => {
  it("renders the shared section header above the saved replies manager", () => {
    const html = renderToStaticMarkup(
      <SettingsSavedRepliesSection
        title="Saved replies"
        subtitle="Manage reusable replies for the shared inbox"
        canManageSavedReplies
      />
    );

    expect(html).toContain("Saved replies");
    expect(html).toContain("Manage reusable replies for the shared inbox");
    expect(html).toContain("manager:true");
  });
});
