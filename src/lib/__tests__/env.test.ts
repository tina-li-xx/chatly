import { getPublicAppUrl, getRuntimeEnvironment, isProductionRuntime } from "@/lib/env";

const ORIGINAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (ORIGINAL_APP_URL === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = ORIGINAL_APP_URL;
  }
});

describe("env", () => {
  it("resolves runtime environment safely", () => {
    expect(getRuntimeEnvironment("")).toBe("development");
    expect(getRuntimeEnvironment("production")).toBe("production");
    expect(getRuntimeEnvironment("test")).toBe("test");
    expect(getRuntimeEnvironment("weird")).toBe("development");
  });

  it("reports production runtime correctly", () => {
    expect(isProductionRuntime("production")).toBe(true);
    expect(isProductionRuntime("development")).toBe(false);
  });

  it("returns a safe public app url fallback", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getPublicAppUrl()).toBe("http://localhost:3000");

    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
    expect(getPublicAppUrl()).toBe("https://chatly.example");
  });
});
