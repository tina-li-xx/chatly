const STRIPE_STANDARD_CARD_RATE = 0.029;
const STRIPE_STANDARD_CARD_FIXED_FEE_CENTS = 30;

export function getStripeProcessingFeeCents(subtotalCents: number) {
  const normalizedSubtotal = Math.max(0, Math.floor(subtotalCents || 0));
  if (normalizedSubtotal === 0) {
    return 0;
  }

  // Gross up the total so the checkout fee line covers Stripe's fee on the fee itself.
  return Math.ceil(
    (normalizedSubtotal + STRIPE_STANDARD_CARD_FIXED_FEE_CENTS) /
      (1 - STRIPE_STANDARD_CARD_RATE) -
      normalizedSubtotal
  );
}

export function getCheckoutChargeTotalCents(subtotalCents: number) {
  const normalizedSubtotal = Math.max(0, Math.floor(subtotalCents || 0));
  return normalizedSubtotal + getStripeProcessingFeeCents(normalizedSubtotal);
}
