import { publicCorsHeaders, publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";

describe("public api helpers", () => {
  it("returns permissive cors headers", () => {
    expect(publicCorsHeaders()).toEqual({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
  });

  it("builds no-content responses with cors headers", () => {
    const response = publicNoContentResponse();
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("builds json responses with merged headers", async () => {
    const response = publicJsonResponse(
      { ok: true },
      {
        status: 201,
        headers: {
          "x-chatting": "1"
        }
      }
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("x-chatting")).toBe("1");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(await response.json()).toEqual({ ok: true });
  });
});
