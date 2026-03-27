const mocks = vi.hoisted(() => ({
  clearUserSession: vi.fn(),
  redirect303: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  clearUserSession: mocks.clearUserSession
}));

vi.mock("@/lib/route-helpers", () => ({
  redirect303: mocks.redirect303
}));

import { POST } from "./route";

describe("logout route", () => {
  beforeEach(() => {
    mocks.redirect303.mockReturnValue(Response.redirect("http://localhost/", 303));
  });

  it("clears the user session and redirects home", async () => {
    const request = new Request("http://localhost/auth/logout", { method: "POST" });

    const response = await POST(request);

    expect(mocks.clearUserSession).toHaveBeenCalledTimes(1);
    expect(mocks.redirect303).toHaveBeenCalledWith(request, "/");
    expect(response.status).toBe(303);
  });
});
