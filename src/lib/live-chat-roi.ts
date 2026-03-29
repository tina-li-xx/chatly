export type LiveChatRoiInputs = {
  monthlyVisitors: number;
  conversionRate: number;
  averageOrderValue: number;
};

export type LiveChatRoiResult = {
  currentConversions: number;
  currentRevenue: number;
  newConversionRate: number;
  newConversions: number;
  newRevenue: number;
  monthlyRevenueLift: number;
  annualRevenueLift: number;
  annualCost: number;
  roiPercent: number;
  paybackDays: number;
};

export const DEFAULT_LIVE_CHAT_ROI_INPUTS: LiveChatRoiInputs = {
  monthlyVisitors: 10000,
  conversionRate: 2.5,
  averageOrderValue: 85
};

const MONTHLY_GROWTH_BASE_PRICE = 29;

export function calculateLiveChatRoi(input: LiveChatRoiInputs): LiveChatRoiResult {
  const currentConversions = input.monthlyVisitors * (input.conversionRate / 100);
  const currentRevenue = currentConversions * input.averageOrderValue;
  const newConversionRate = input.conversionRate * 1.2;
  const newConversions = input.monthlyVisitors * (newConversionRate / 100);
  const newRevenue = newConversions * input.averageOrderValue;
  const monthlyRevenueLift = newRevenue - currentRevenue;
  const annualRevenueLift = monthlyRevenueLift * 12;
  const annualCost = MONTHLY_GROWTH_BASE_PRICE * 12;
  const roiPercent = annualCost === 0 ? 0 : (annualRevenueLift / annualCost) * 100;
  const paybackDays =
    monthlyRevenueLift <= 0
      ? Number.POSITIVE_INFINITY
      : MONTHLY_GROWTH_BASE_PRICE / (monthlyRevenueLift / 30);

  return {
    currentConversions,
    currentRevenue,
    newConversionRate,
    newConversions,
    newRevenue,
    monthlyRevenueLift,
    annualRevenueLift,
    annualCost,
    roiPercent,
    paybackDays
  };
}

export function formatWholeCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}
