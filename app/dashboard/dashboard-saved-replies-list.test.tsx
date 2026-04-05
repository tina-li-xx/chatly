import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSavedRepliesList } from "./dashboard-saved-replies-list";

const REPLIES = [
  {
    id: "reply_1",
    title: "Pricing",
    body: "Thanks for reaching out about pricing.",
    tags: ["pricing", "sales"],
    updatedAt: "2026-04-04T10:00:00.000Z"
  }
];

describe("saved replies list", () => {
  it("keeps loaded replies inside the shared padded settings card body", () => {
    const html = renderToStaticMarkup(
      <DashboardSavedRepliesList
        replies={REPLIES}
        canManage
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain("border-t border-slate-200 px-6 py-5 space-y-3");
    expect(html).toContain("rounded-lg bg-slate-50 px-4 py-4");
    expect(html).toContain("Pricing");
    expect(html).toContain("Edit");
    expect(html).toContain("Delete");
  });
});
