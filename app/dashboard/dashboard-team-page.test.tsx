import { renderToStaticMarkup } from "react-dom/server";

import { DashboardTeamPage } from "./dashboard-team-page";

describe("dashboard team page", () => {
  it("renders owner rows, pending invites, and the invite modal trigger", () => {
    const html = renderToStaticMarkup(
      <DashboardTeamPage
        initialMembers={[
          {
            id: "member_1",
            name: "Tina Bauer",
            email: "tina@chatly.example",
            initials: "TB",
            role: "owner",
            status: "online",
            lastActiveLabel: "Just now",
            isCurrentUser: true,
            avatarDataUrl: null
          }
        ]}
        initialInvites={[
          {
            id: "invite_1",
            email: "alex@example.com",
            role: "admin",
            status: "pending",
            message: "Join us",
            createdAt: "2026-03-27T10:00:00.000Z",
            updatedAt: "2026-03-27T11:00:00.000Z"
          }
        ]}
      />
    );

    expect(html).toContain("Keep the workspace owner and any pending inbox invites organized in one place.");
    expect(html).toContain("Invite member");
    expect(html).toContain("Tina Bauer");
    expect(html).toContain("(You)");
    expect(html).toContain("alex@example.com");
    expect(html).toContain("Pending");
  });
});
