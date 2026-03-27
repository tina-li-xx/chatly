describe("stripe helpers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("reports whether stripe is configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PRICE_PRO_MONTHLY = "price_123";
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";

    let stripeModule = await import("@/lib/stripe");
    expect(stripeModule.isStripeConfigured()).toBe(true);
    expect(stripeModule.isStripeBillingReady()).toBe(true);

    vi.resetModules();
    process.env.STRIPE_SECRET_KEY = "";
    stripeModule = await import("@/lib/stripe");
    expect(stripeModule.isStripeConfigured()).toBe(false);
    expect(stripeModule.isStripeBillingReady()).toBe(false);
  });

  it("treats missing webhook setup as not billing-ready", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PRICE_PRO_MONTHLY = "price_123";
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const stripeModule = await import("@/lib/stripe");
    expect(stripeModule.isStripeConfigured()).toBe(true);
    expect(stripeModule.isStripeBillingReady()).toBe(false);
  });

  it("returns normalized stripe app urls", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example///";
    const stripeModule = await import("@/lib/stripe");

    expect(stripeModule.getStripeAppUrl()).toBe("https://chatly.example");
  });

  it("throws a stripe-specific error when required env is missing", async () => {
    delete process.env.STRIPE_PRICE_PRO_MONTHLY;
    const stripeModule = await import("@/lib/stripe");

    expect(() => stripeModule.getStripeProPriceId()).toThrow("STRIPE_NOT_CONFIGURED");
  });

  it("caches the stripe client", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PRICE_PRO_MONTHLY = "price_123";
    process.env.NEXT_PUBLIC_APP_URL = "https://chatly.example";

    const stripeModule = await import("@/lib/stripe");
    expect(stripeModule.getStripe()).toBe(stripeModule.getStripe());
  });
});
