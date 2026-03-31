import type Stripe from "stripe";
import {
  BILLING_TRIAL_DAYS,
  type BillingInterval,
  type BillingPlanKey,
  isPaidPlan,
  normalizeBillingPlanKey
} from "@/lib/billing-plans";
import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import { isLocalGrowthTrialActive } from "@/lib/billing-trial-state";
import {
  clearBillingPaymentMethodRow,
  findBillingAccountRowByStripeCustomerId,
  findBillingAccountRowByStripeSubscriptionId,
  insertBillingInvoiceRow,
  upsertBillingAccountRow,
  upsertBillingPaymentMethodRow
} from "@/lib/repositories/billing-repository";
import { syncReferralRewardsForUser } from "@/lib/referrals";
import {
  getStripe,
  getStripeAppUrl,
  getStripePriceId,
  isStripeBillingReady,
  isStripeConfigured
} from "@/lib/stripe";

function toIsoFromUnix(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000).toISOString() : null;
}

function getStripePriceIdValue(value: string | Stripe.Price | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function resolvePlanFromPriceId(priceId: string | null | undefined) {
  const paidPlans: Array<{ planKey: BillingPlanKey; billingInterval: BillingInterval }> = [
    { planKey: "growth", billingInterval: "monthly" },
    { planKey: "growth", billingInterval: "annual" }
  ];

  for (const plan of paidPlans) {
    if (priceId === getStripePriceId(plan.planKey, plan.billingInterval)) {
      return plan;
    }
  }

  return {
    planKey: "starter" as const,
    billingInterval: "monthly" as const
  };
}

function getActiveSubscription(subscriptions: Stripe.Subscription[]): Stripe.Subscription | null {
  const priority = ["active", "trialing", "past_due", "unpaid", "incomplete", "canceled", "incomplete_expired"];

  return [...subscriptions].sort((left, right) => {
    const leftScore = priority.indexOf(left.status);
    const rightScore = priority.indexOf(right.status);

    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }

    return right.created - left.created;
  })[0] ?? null;
}

function getDefaultPaymentMethod(customer: Stripe.Customer) {
  const candidate = customer.invoice_settings?.default_payment_method;
  if (!candidate || typeof candidate === "string") {
    return null;
  }

  if (candidate.type !== "card" || !candidate.card) {
    return null;
  }

  return candidate;
}

function metadataValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized || null;
}

function subscriptionTimestamp(
  subscription: Stripe.Subscription | null | undefined,
  key: "current_period_end" | "trial_start" | "trial_end"
) {
  const value = (
    subscription as
      | (Stripe.Subscription &
          Partial<Record<"current_period_end" | "trial_start" | "trial_end", number>>)
      | null
      | undefined
  )?.[key];
  return typeof value === "number" ? value : null;
}

async function ensureStripeCustomer(userId: string, email: string) {
  const account = await ensureOwnerGrowthTrialBillingAccount(userId);
  const stripe = getStripe();

  if (account?.stripe_customer_id) {
    return {
      customerId: account.stripe_customer_id,
      account
    };
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId
    }
  });

  await upsertBillingAccountRow({
    userId,
    planKey: account?.plan_key ?? "starter",
    billingInterval: account?.billing_interval ?? "monthly",
    seatQuantity: account?.seat_quantity ?? 1,
    nextBillingDate: account?.next_billing_date ?? null,
    stripeCustomerId: customer.id,
    stripeSubscriptionId: account?.stripe_subscription_id ?? null,
    stripePriceId: account?.stripe_price_id ?? null,
    stripeStatus: account?.stripe_status ?? null,
    stripeCurrentPeriodEnd: account?.stripe_current_period_end ?? null,
    trialStartedAt: account?.trial_started_at ?? null,
    trialEndsAt: account?.trial_ends_at ?? null,
    trialExtensionUsedAt: account?.trial_extension_used_at ?? null
  });

  return {
    customerId: customer.id,
    account
  };
}

async function syncSubscriptionSeatQuantityIfNeeded(
  stripe: Stripe,
  subscription: Stripe.Subscription | null,
  desiredSeatCount?: number
) {
  if (!subscription || !desiredSeatCount) {
    return subscription;
  }

  const item = subscription.items.data[0];
  if (!item || subscription.status === "canceled") {
    return subscription;
  }

  const currentQuantity = item.quantity ?? 1;
  const nextQuantity = Math.max(1, Math.floor(desiredSeatCount));

  if (currentQuantity === nextQuantity) {
    return subscription;
  }

  return stripe.subscriptions.update(subscription.id, {
    items: [
      {
        id: item.id,
        quantity: nextQuantity
      }
    ],
    proration_behavior: subscription.status === "trialing" ? "none" : "create_prorations"
  });
}

export async function createStripeCheckoutSession(
  userId: string,
  email: string,
  input: {
    planKey: BillingPlanKey;
    billingInterval: BillingInterval;
    seatQuantity: number;
  }
) {
  if (!isStripeBillingReady()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  if (!isPaidPlan(input.planKey)) {
    throw new Error("STRIPE_CHECKOUT_UNAVAILABLE");
  }

  const stripe = getStripe();
  const { customerId } = await ensureStripeCustomer(userId, email);
  const appUrl = getStripeAppUrl();
  const seatQuantity = Math.max(1, Math.floor(input.seatQuantity || 1));
  const priceId = getStripePriceId(input.planKey, input.billingInterval);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: seatQuantity
      }
    ],
    success_url: `${appUrl}/dashboard/settings?section=billing&billing=checkout-success`,
    cancel_url: `${appUrl}/dashboard/settings?section=billing&billing=checkout-cancelled`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      userId,
      planKey: input.planKey,
      billingInterval: input.billingInterval,
      seatQuantity: String(seatQuantity)
    },
    subscription_data: {
      trial_period_days: BILLING_TRIAL_DAYS,
      metadata: {
        userId,
        planKey: input.planKey,
        billingInterval: input.billingInterval,
        seatQuantity: String(seatQuantity)
      }
    }
  });

  if (!session.url) {
    throw new Error("STRIPE_CHECKOUT_UNAVAILABLE");
  }

  return session.url;
}

export async function createStripeBillingPortalSession(userId: string, email: string) {
  if (!isStripeBillingReady()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const stripe = getStripe();
  const { customerId } = await ensureStripeCustomer(userId, email);
  const appUrl = getStripeAppUrl();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/settings?section=billing&billing=portal-return`
  });

  return session.url;
}

export async function syncStripeBillingState(userId: string, email?: string, desiredSeatCount?: number) {
  if (!isStripeConfigured()) {
    return null;
  }

  const account = await ensureOwnerGrowthTrialBillingAccount(userId);
  const stripeCustomerId =
    account?.stripe_customer_id ?? (email ? (await ensureStripeCustomer(userId, email)).customerId : null);

  if (!stripeCustomerId) {
    return null;
  }

  const stripe = getStripe();
  const [customerResult, subscriptions, invoices] = await Promise.all([
    stripe.customers.retrieve(stripeCustomerId, {
      expand: ["invoice_settings.default_payment_method"]
    }),
    stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10
    }),
    stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 12
    })
  ]);

  if (customerResult.deleted) {
    return null;
  }

  const customer = customerResult;
  let subscription = getActiveSubscription(subscriptions.data);
  subscription = await syncSubscriptionSeatQuantityIfNeeded(stripe, subscription, desiredSeatCount);

  const subscriptionItem = subscription?.items.data[0] ?? null;
  const priceId = subscriptionItem?.price?.id ?? null;
  const localGrowthTrialActive = isLocalGrowthTrialActive({
    planKey: normalizeBillingPlanKey(account.plan_key),
    stripeSubscriptionId: account.stripe_subscription_id,
    trialEndsAt: account.trial_ends_at
  });
  const plan = priceId
    ? resolvePlanFromPriceId(priceId)
    : localGrowthTrialActive
      ? {
          planKey: "growth" as const,
          billingInterval: account.billing_interval
        }
      : {
          planKey: "starter" as const,
          billingInterval: "monthly" as const
        };
  const nextBillingDate =
    subscription && subscription.status !== "canceled"
      ? toIsoFromUnix(subscriptionTimestamp(subscription, "current_period_end"))
      : localGrowthTrialActive
        ? account.trial_ends_at
        : null;
  const seatQuantity = Math.max(
    1,
    subscriptionItem?.quantity ?? desiredSeatCount ?? account?.seat_quantity ?? 1
  );
  const trialExtensionUsedAt =
    metadataValue(subscription?.metadata?.trialExtensionUsedAt) ??
    (localGrowthTrialActive ? account.trial_extension_used_at : null);

  await upsertBillingAccountRow({
    userId,
    planKey: plan.planKey,
    billingInterval: plan.billingInterval,
    seatQuantity,
    nextBillingDate,
    stripeCustomerId,
    stripeSubscriptionId: subscription?.id ?? null,
    stripePriceId: priceId,
    stripeStatus: subscription?.status ?? null,
    stripeCurrentPeriodEnd: subscription ? nextBillingDate : null,
    trialStartedAt: subscription
      ? toIsoFromUnix(subscriptionTimestamp(subscription, "trial_start"))
      : localGrowthTrialActive
        ? account.trial_started_at
        : null,
    trialEndsAt: subscription
      ? toIsoFromUnix(subscriptionTimestamp(subscription, "trial_end"))
      : localGrowthTrialActive
        ? account.trial_ends_at
        : null,
    trialExtensionUsedAt
  });

  const paymentMethod = getDefaultPaymentMethod(customer);
  if (paymentMethod?.card) {
    await upsertBillingPaymentMethodRow({
      userId,
      stripePaymentMethodId: paymentMethod.id,
      brand: paymentMethod.card.brand || "Card",
      last4: paymentMethod.card.last4 || "",
      expMonth: paymentMethod.card.exp_month || 0,
      expYear: paymentMethod.card.exp_year || 0,
      holderName: paymentMethod.billing_details?.name || customer.name || customer.email || email || ""
    });
  } else {
    await clearBillingPaymentMethodRow(userId);
  }

  for (const invoice of invoices.data) {
    const invoiceLine = invoice.lines.data[0];
    const invoicePlan = resolvePlanFromPriceId(
      getStripePriceIdValue(invoiceLine?.pricing?.price_details?.price)
    );

    await insertBillingInvoiceRow({
      id: invoice.id,
      userId,
      stripeInvoiceId: invoice.id,
      planKey: invoicePlan.planKey,
      billingInterval: invoicePlan.billingInterval,
      seatQuantity: invoiceLine?.quantity ?? null,
      description: invoice.description || invoiceLine?.description || "Chatting billing event",
      amountCents: invoice.amount_paid || invoice.amount_due || 0,
      currency: invoice.currency?.toUpperCase() || "USD",
      status: invoice.status === "paid" ? "paid" : "open",
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdfUrl: invoice.invoice_pdf,
      issuedAt: toIsoFromUnix(invoice.created) || new Date().toISOString(),
      paidAt: toIsoFromUnix(invoice.status_transitions?.paid_at),
      periodStart: toIsoFromUnix(invoice.period_start),
      periodEnd: toIsoFromUnix(invoice.period_end)
    });
  }

  return {
    customerId: stripeCustomerId,
    subscriptionId: subscription?.id ?? null
  };
}

export async function syncStripeBillingStateFromEvent(input: {
  customerId?: string | null;
  subscriptionId?: string | null;
  userId?: string | null;
}) {
  if (!isStripeConfigured()) {
    return;
  }

  const customerId = input.customerId?.trim() || null;
  const subscriptionId = input.subscriptionId?.trim() || null;

  let userId = input.userId?.trim() || null;

  if (!userId && customerId) {
    userId = (await findBillingAccountRowByStripeCustomerId(customerId))?.user_id ?? null;
  }

  if (!userId && subscriptionId) {
    userId = (await findBillingAccountRowByStripeSubscriptionId(subscriptionId))?.user_id ?? null;
  }

  if (!userId) {
    return;
  }

  if (customerId) {
    const existing = await ensureOwnerGrowthTrialBillingAccount(userId);
    await upsertBillingAccountRow({
      userId,
      planKey: existing.plan_key,
      billingInterval: existing.billing_interval,
      seatQuantity: existing.seat_quantity,
      nextBillingDate: existing.next_billing_date,
      stripeCustomerId: customerId,
      stripeSubscriptionId: existing.stripe_subscription_id,
      stripePriceId: existing.stripe_price_id,
      stripeStatus: existing.stripe_status,
      stripeCurrentPeriodEnd: existing.stripe_current_period_end,
      trialStartedAt: existing.trial_started_at,
      trialEndsAt: existing.trial_ends_at,
      trialExtensionUsedAt: existing.trial_extension_used_at
    });
  }

  await syncStripeBillingState(userId);
  await syncReferralRewardsForUser(userId);
}
