import { sanitizeAlertValue, stringifyAlertValue } from "@/lib/error-alerts/redaction";

describe("error alert redaction", () => {
  it("redacts sensitive keys recursively", () => {
    expect(
      sanitizeAlertValue({
        password: "super-secret",
        nested: {
          authToken: "abc123",
          keep: "visible"
        }
      })
    ).toEqual({
      password: "[REDACTED]",
      nested: {
        authToken: "[REDACTED]",
        keep: "visible"
      }
    });
  });

  it("stringifies redacted payloads safely", () => {
    expect(stringifyAlertValue({ cookie: "session=secret" })).toContain("[REDACTED]");
  });
});
