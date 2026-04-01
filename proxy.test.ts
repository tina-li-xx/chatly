import { NextRequest } from "next/server";
import { proxy } from "./proxy";

describe("proxy", () => {
  it("returns a 404 for blocked probe paths", () => {
    const response = proxy(new NextRequest("https://usechatting.com/xmlrpc.php"));

    expect(response.status).toBe(404);
  });

  it("passes through valid app routes", () => {
    const response = proxy(new NextRequest("https://usechatting.com/login"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
