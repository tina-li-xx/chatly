import type Stripe from "stripe";
import {
  clearBillingPaymentMethodRow,
  findBillingAccountRow,
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
  getStripeProPriceId,
  isStripeBillingReady,
  isStripeConfigured
} from "@/lib/stripe";

function toIsoFromUnix(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000).toISOString() : null;
}

function mapStripeStatusToPlan(priceId: string | null | undefined) {
  return priceId === getStripeProPriceId() ? ("pro" as const) : ("starter" as const);
}

function getStripePriceId(value: string | Stripe.Price | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function getActiveSubscription(subscriptions: Stripe.Subscription[]) {
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

async function ensureStripeCustomer(userId: string, email: string) {
  const account = await findBillingAccountRow(userId);
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
    nextBillingDate: account?.next_billing_date ?? null,
    stripeCustomerId: customer.id,
    stripeSubscriptionId: account?.stripe_subscription_id ?? null,
    stripePriceId: account?.stripe_price_id ?? null,
    stripeStatus: account?.stripe_status ?? null,
    stripeCurrentPeriodEnd: account?.stripe_current_period_end ?? null
  });

  return {
    customerId: customer.id,
    account
  };
}

export async function createStripeCheckoutSession(userId: string, email: string) {
  if (!isStripeBillingReady()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const stripe = getStripe();
  const { customerId } = await ensureStripeCustomer(userId, email);
  const appUrl = getStripeAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: getStripeProPriceId(),
        quantity: 1
      }
    ],
    success_url: `${appUrl}/dashboard/settings?section=billing&billing=checkout-success`,
    cancel_url: `${appUrl}/dashboard/settings?section=billing&billing=checkout-cancelled`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      userId
    },
    subscription_data: {
      metadata: {
        userId
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

export async function syncStripeBillingState(userId: string, email?: string) {
  if (!isStripeConfigured()) {
    return null;
  }

  const account = await findBillingAccountRow(userId);
  const stripeCustomerId = account?.stripe_customer_id ?? (email ? (await ensureStripeCustomer(userId, email)).customerId : null);

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
  const subscription = getActiveSubscription(subscriptions.data);
  const subscriptionItem = subscription?.items.data[0] ?? null;
  const priceId = subscriptionItem?.price?.id ?? null;
  const planKey = mapStripeStatusToPlan(priceId);
  const nextBillingDate =
    subscription && subscription.status !== "canceled"
      ? toIsoFromUnix(subscriptionItem?.current_period_end)
      : null;

  await upsertBillingAccountRow({
    userId,
    planKey,
    nextBillingDate,
    stripeCustomerId,
    stripeSubscriptionId: subscription?.id ?? null,
    stripePriceId: priceId,
    stripeStatus: subscription?.status ?? null,
    stripeCurrentPeriodEnd: nextBillingDate
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

    await insertBillingInvoiceRow({
      id: invoice.id,
      userId,
      stripeInvoiceId: invoice.id,
      planKey: mapStripeStatusToPlan(getStripePriceId(invoiceLine?.pricing?.price_details?.price)),
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
    const existing = await findBillingAccountRow(userId);
    await upsertBillingAccountRow({
      userId,
      planKey: existing?.plan_key ?? "starter",
      nextBillingDate: existing?.next_billing_date ?? null,
      stripeCustomerId: customerId,
      stripeSubscriptionId: existing?.stripe_subscription_id ?? null,
      stripePriceId: existing?.stripe_price_id ?? null,
      stripeStatus: existing?.stripe_status ?? null,
      stripeCurrentPeriodEnd: existing?.stripe_current_period_end ?? null
    });
  }

  await syncStripeBillingState(userId);
  await syncReferralRewardsForUser(userId);
}
