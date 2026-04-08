export type AppEnvValidationGroup =
  | "startup-production-core"
  | "integrations"
  | "stripe-checkout"
  | "stripe-billing"
  | "r2"
  | "ses"
  | "minimax";

type AppEnvDefinition = {
  aliases?: readonly string[];
  defaultValue?: string;
  exampleValue?: string;
  requiredIn?: readonly AppEnvValidationGroup[];
};

export const APP_ENV_DEFINITIONS = {
  APP_NAME: {
    defaultValue: "Chatting",
    exampleValue: "Chatting"
  },
  AUTH_SECRET: {
    exampleValue: "change-me",
    requiredIn: ["startup-production-core"]
  },
  AWS_ACCESS_KEY_ID: {
    exampleValue: ""
  },
  AWS_REGION: {
    exampleValue: "",
    requiredIn: ["ses"]
  },
  AWS_SECRET_ACCESS_KEY: {
    exampleValue: ""
  },
  DATABASE_URL: {
    exampleValue: "postgres://postgres:postgres@localhost:5432/chatly",
    requiredIn: ["startup-production-core"]
  },
  INTEGRATIONS_ENCRYPTION_KEY: {
    exampleValue: "",
    requiredIn: ["integrations"]
  },
  MINIMAX_API_KEY: {
    exampleValue: "",
    requiredIn: ["minimax"]
  },
  MINIMAX_BASE_URL: {
    defaultValue: "https://api.minimax.io",
    exampleValue: "https://api.minimax.io"
  },
  MINIMAX_MODEL: {
    defaultValue: "MiniMax-M2",
    exampleValue: "MiniMax-M2"
  },
  NEXT_PUBLIC_APP_URL: {
    defaultValue: "https://usechatting.com",
    exampleValue: "https://usechatting.com",
    requiredIn: ["startup-production-core", "stripe-checkout", "stripe-billing"]
  },
  NEXT_PUBLIC_ZAPIER_APP_URL: {
    exampleValue: "https://zapier.com/developer/public-invite/<your-private-invite-id>",
    requiredIn: ["integrations"]
  },
  R2_ACCESS_KEY_ID: {
    exampleValue: "",
    requiredIn: ["r2"]
  },
  R2_ACCOUNT_ID: {
    exampleValue: "",
    requiredIn: ["r2"]
  },
  R2_BUCKET_NAME: {
    exampleValue: "",
    requiredIn: ["r2"]
  },
  R2_PUBLIC_BASE_URL: {
    exampleValue: "",
    requiredIn: ["r2"]
  },
  R2_SECRET_ACCESS_KEY: {
    exampleValue: "",
    requiredIn: ["r2"]
  },
  REPLY_DOMAIN: {
    exampleValue: ""
  },
  SLACK_CLIENT_ID: {
    exampleValue: "",
    requiredIn: ["integrations"]
  },
  SLACK_CLIENT_SECRET: {
    exampleValue: "",
    requiredIn: ["integrations"]
  },
  SLACK_SIGNING_SECRET: {
    exampleValue: "",
    requiredIn: ["integrations"]
  },
  SHOPIFY_CLIENT_ID: {
    exampleValue: "",
    requiredIn: ["integrations"]
  },
  SHOPIFY_CLIENT_SECRET: {
    exampleValue: "",
    requiredIn: ["integrations"]
  },
  SES_INBOUND_SNS_TOPIC_ARN: {
    aliases: ["AWS_SES_INBOUND_SNS_TOPIC_ARN"],
    exampleValue: ""
  },
  STRIPE_PRICE_GROWTH_ANNUAL: {
    exampleValue: "",
    requiredIn: ["stripe-checkout", "stripe-billing"]
  },
  STRIPE_PRICE_GROWTH_MONTHLY: {
    exampleValue: "",
    requiredIn: ["stripe-checkout", "stripe-billing"]
  },
  STRIPE_SECRET_KEY: {
    exampleValue: "",
    requiredIn: ["stripe-checkout", "stripe-billing"]
  },
  STRIPE_WEBHOOK_SECRET: {
    exampleValue: "",
    requiredIn: ["stripe-billing"]
  }
} as const satisfies Record<string, AppEnvDefinition>;

export type AppEnvName = keyof typeof APP_ENV_DEFINITIONS;

export const APP_ENV_EXAMPLE_ORDER = [
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_ZAPIER_APP_URL",
  "AUTH_SECRET",
  "INTEGRATIONS_ENCRYPTION_KEY",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "REPLY_DOMAIN",
  "SLACK_CLIENT_ID",
  "SLACK_CLIENT_SECRET",
  "SLACK_SIGNING_SECRET",
  "SHOPIFY_CLIENT_ID",
  "SHOPIFY_CLIENT_SECRET",
  "SES_INBOUND_SNS_TOPIC_ARN",
  "APP_NAME",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_GROWTH_MONTHLY",
  "STRIPE_PRICE_GROWTH_ANNUAL",
  "MINIMAX_API_KEY",
  "MINIMAX_MODEL",
  "MINIMAX_BASE_URL"
] as const satisfies readonly AppEnvName[];

export function getEnvDefinition(name: string) {
  return (APP_ENV_DEFINITIONS as Record<string, AppEnvDefinition>)[name] || null;
}

export function getRequiredEnvVarNamesForGroup(group: AppEnvValidationGroup) {
  return (Object.entries(APP_ENV_DEFINITIONS) as Array<[AppEnvName, AppEnvDefinition]>)
    .filter(([, definition]) => definition.requiredIn?.includes(group))
    .map(([name]) => name);
}
