export type WelcomeMessageScenario = "pricing" | "product" | "support" | "checkout";
export type WelcomeMessageTone = "friendly" | "direct" | "concierge";
export type WelcomeMessageVariant = { id: string; label: string; message: string };

const variationLabels = ["Recommended", "More proactive", "Lower pressure"] as const;

const toneOpeners: Record<WelcomeMessageTone, string[]> = {
  friendly: ["Hey there!", "Hi there!", "Welcome!", "Thanks for stopping by!"],
  direct: ["Hi.", "Hello.", "Quick note:", "Hi there."],
  concierge: ["Welcome in.", "Glad you're here.", "Hello and welcome.", "Happy to help."]
};

const scenarioBodies: Record<WelcomeMessageScenario, string[]> = {
  pricing: [
    "If you're comparing plans, I can help you find the best fit fast.",
    "If pricing is the sticking point, I can make the differences simple.",
    "If you want the quickest recommendation, tell me what you need.",
    "If you want to avoid overpaying, I can point you to the right option."
  ],
  product: [
    "If you're choosing between options, I can help you narrow it down.",
    "If you have product questions, I can point you to the best match.",
    "If you're not sure what fits best, tell me what you're looking for.",
    "If you want a quick recommendation, I can help you compare the details."
  ],
  support: [
    "If something's blocking you, I can help you sort it out.",
    "If you need a fast answer, send over the issue and I'll jump in.",
    "If support is the reason you landed here, you're in the right place.",
    "If you want help without the back-and-forth, tell me what's happening."
  ],
  checkout: [
    "If a last-minute question is holding up checkout, I can help.",
    "If you need a quick answer before you buy, ask away.",
    "If something feels uncertain before checkout, I can clear it up.",
    "If you want a final nudge with shipping, returns, or fit, I'm here."
  ]
};

const toneClosers: Record<WelcomeMessageTone, string[]> = {
  friendly: ["Ask me anything.", "Happy to help.", "Tell me what you're deciding between.", "I can walk you through it."],
  direct: ["Ask your question here.", "Tell me what you need.", "I can give you a quick answer.", "I'll keep it straightforward."],
  concierge: [
    "I can guide you from here.",
    "I'm here if you want a tailored recommendation.",
    "Happy to walk you through it.",
    "I can help you choose with confidence."
  ]
};

function rotate<T>(items: T[], offset: number) {
  return items.map((_, index) => items[(index + offset) % items.length]);
}

export function generateWelcomeMessageVariants(
  scenario: WelcomeMessageScenario,
  tone: WelcomeMessageTone,
  seed = 0
): WelcomeMessageVariant[] {
  const openers = rotate(toneOpeners[tone], seed);
  const bodies = rotate(scenarioBodies[scenario], seed + 1);
  const closers = rotate(toneClosers[tone], seed + 2);

  return variationLabels.map((label, index) => ({
    id: `${scenario}-${tone}-${seed}-${index}`,
    label,
    message: `${openers[index]} ${bodies[index]} ${closers[index]}`
  }));
}

export function generateWelcomeMessage(scenario: WelcomeMessageScenario, tone: WelcomeMessageTone) {
  return generateWelcomeMessageVariants(scenario, tone)[0].message;
}
