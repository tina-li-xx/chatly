import "server-only";

import type {
  ShopifyCustomerContext,
  ShopifyCustomerOrderSummary
} from "@/lib/dashboard-integrations";
import { SHOPIFY_API_VERSION } from "@/lib/shopify-integration";

type Money = {
  amount?: string;
  currencyCode?: string;
};

type ShopifyGraphqlResponse = {
  data?: {
    customers?: {
      nodes?: Array<{
        displayName?: string;
        legacyResourceId?: string | number;
        createdAt?: string;
        numberOfOrders?: string | number;
        amountSpent?: Money | null;
        lastOrder?: { createdAt?: string | null } | null;
        orders?: {
          nodes?: Array<{
            name?: string;
            createdAt?: string;
            displayFulfillmentStatus?: string | null;
            currentTotalPriceSet?: {
              shopMoney?: Money | null;
            } | null;
            lineItems?: {
              nodes?: Array<{ name?: string | null }> | null;
            } | null;
          }>;
        } | null;
      }>;
    };
  };
  errors?: Array<{ message?: string }>;
};

const CUSTOMER_QUERY = `#graphql
  query ChattingShopifyCustomerContext($query: String!) {
    customers(first: 1, query: $query, sortKey: UPDATED_AT) {
      nodes {
        displayName
        legacyResourceId
        createdAt
        numberOfOrders
        amountSpent {
          amount
          currencyCode
        }
        lastOrder {
          createdAt
        }
        orders(first: 2, reverse: true) {
          nodes {
            name
            createdAt
            displayFulfillmentStatus
            currentTotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            lineItems(first: 2) {
              nodes {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyCustomerContext(input: {
  accessToken: string;
  domain: string;
  email: string;
}): Promise<ShopifyCustomerContext | null> {
  const response = await fetch(
    `https://${input.domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-shopify-access-token": input.accessToken
      },
      body: JSON.stringify({
        query: CUSTOMER_QUERY,
        variables: { query: `email:${JSON.stringify(input.email)}` }
      })
    }
  );

  if (!response.ok) {
    throw new Error("SHOPIFY_CUSTOMER_CONTEXT_FAILED");
  }

  const payload = (await response.json()) as ShopifyGraphqlResponse;
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "SHOPIFY_CUSTOMER_CONTEXT_FAILED");
  }

  const customer = payload.data?.customers?.nodes?.[0];
  if (!customer) {
    return null;
  }

  const totalOrders = Number(customer.numberOfOrders ?? 0);
  const recentOrders = (customer.orders?.nodes ?? []).map((order) =>
    buildOrderSummary(order)
  );

  return {
    displayName: customer.displayName || input.email,
    customerSinceLabel: monthYear(customer.createdAt),
    totalOrders,
    totalSpentLabel: moneyLabel(customer.amountSpent),
    lastOrderLabel: longDate(customer.lastOrder?.createdAt),
    recentOrders,
    customerUrl: customer.legacyResourceId
      ? `https://${input.domain}/admin/customers/${customer.legacyResourceId}`
      : `https://${input.domain}/admin/customers?query=${encodeURIComponent(input.email)}`
  };
}

function buildOrderSummary(order: {
  name?: string;
  createdAt?: string;
  displayFulfillmentStatus?: string | null;
  currentTotalPriceSet?: { shopMoney?: Money | null } | null;
  lineItems?: { nodes?: Array<{ name?: string | null }> | null } | null;
}): ShopifyCustomerOrderSummary {
  return {
    id: order.name || "Order",
    totalLabel: moneyLabel(order.currentTotalPriceSet?.shopMoney),
    dateLabel: shortDate(order.createdAt),
    itemsLabel:
      order.lineItems?.nodes
        ?.map((item) => item.name?.trim())
        .filter(Boolean)
        .join(", ") || "Order items",
    statusLabel: titleCase(order.displayFulfillmentStatus, "Unknown")
  };
}

function moneyLabel(money?: Money | null) {
  if (!money?.amount) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode || "USD"
  }).format(Number(money.amount));
}

function monthYear(value?: string | null) {
  return formatDate(value, { month: "short", year: "numeric" }, "Unknown");
}

function longDate(value?: string | null) {
  return formatDate(
    value,
    { month: "short", day: "numeric", year: "numeric" },
    "No orders yet"
  );
}

function shortDate(value?: string | null) {
  return formatDate(value, { month: "short", day: "numeric" }, "Unknown");
}

function formatDate(
  value: string | null | undefined,
  format: Intl.DateTimeFormatOptions,
  fallback: string
) {
  return value
    ? new Intl.DateTimeFormat("en-US", format).format(new Date(value))
    : fallback;
}

function titleCase(value?: string | null, fallback = "") {
  if (!value) {
    return fallback;
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
