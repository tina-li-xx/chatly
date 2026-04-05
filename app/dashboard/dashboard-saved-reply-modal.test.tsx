import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSavedReplyModal } from "./dashboard-saved-reply-modal";

describe("dashboard saved reply modal", () => {
  it("renders the optional tags field alongside title and body inputs", () => {
    const html = renderToStaticMarkup(
      <DashboardSavedReplyModal
        title="New saved reply"
        description="Reusable replies for the team inbox."
        values={{ title: "Pricing", body: "Hello", tags: "pricing, sales" }}
        saving={false}
        onChange={vi.fn()}
        onClose={vi.fn()}
        onSave={vi.fn(async () => {})}
      />
    );

    expect(html).toContain("Title");
    expect(html).toContain("Reply body");
    expect(html).toContain("Tags");
    expect(html).toContain("pricing, follow-up, onboarding");
  });
});
