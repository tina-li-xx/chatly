vi.mock("@/lib/env", () => ({
  getPublicAppUrl: () => "https://usechatting.com"
}));

import { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("proxy", () => {
  it("permanently redirects www requests onto the canonical apex host", () => {
    const response = proxy(new NextRequest("https://www.usechatting.com/blog?ref=search-console"));

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://usechatting.com/blog?ref=search-console");
  });

  it("returns a 404 for blocked probe paths", () => {
    const response = proxy(new NextRequest("https://usechatting.com/xmlrpc.php"));

    expect(response.status).toBe(404);
  });

  it("redirects logged-out dashboard visits back through login with the original path", () => {
    const response = proxy(new NextRequest("https://usechatting.com/dashboard/inbox?id=dcf2737d-27ce-4286-8553-e06ecfdcf95b"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://usechatting.com/login?redirectTo=%2Fdashboard%2Finbox%3Fid%3Ddcf2737d-27ce-4286-8553-e06ecfdcf95b"
    );
  });

  it("passes through valid app routes", () => {
    const response = proxy(new NextRequest("https://usechatting.com/login"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
