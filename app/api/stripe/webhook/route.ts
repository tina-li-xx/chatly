import { NextResponse } from "next/server";
import Stripe from "stripe";
import { syncStripeBillingStateFromEvent } from "@/lib/stripe-billing";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

function extractEventContext(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        customerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        subscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null,
        userId: session.metadata?.userId ?? null
      };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      return {
        customerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id ?? null,
        subscriptionId: subscription.id,
        userId: subscription.metadata?.userId ?? null
      };
    }
    case "invoice.payment_succeeded":
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscription = invoice.parent?.subscription_details?.subscription;

      return {
        customerId:
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? null,
        subscriptionId:
          typeof subscription === "string"
            ? subscription
            : subscription?.id ?? null,
        userId: invoice.parent?.subscription_details?.metadata?.userId ?? invoice.metadata?.userId ?? null
      };
    }
    case "customer.updated": {
      const customer = event.data.object as Stripe.Customer;
      return {
        customerId: customer.id,
        subscriptionId: null,
        userId: customer.metadata?.userId ?? null
      };
    }
    default:
      return null;
  }
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "missing signature" }, { status: 400 });
    }

    const payload = await request.text();
    const event = getStripe().webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
    const context = extractEventContext(event);

    if (context) {
      await syncStripeBillingStateFromEvent(context);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("stripe webhook error", error);
    return NextResponse.json({ error: "invalid webhook" }, { status: 400 });
  }
}
