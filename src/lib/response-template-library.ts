export type ResponseTemplateCategory = "greetings" | "apologies" | "handoffs" | "follow-ups";

export type ResponseTemplate = {
  title: string;
  category: ResponseTemplateCategory;
  body: string;
};

export const responseTemplates: ResponseTemplate[] = [
  { title: "Friendly greeting", category: "greetings", body: "Hi [Name]! Thanks for reaching out. How can I help today?" },
  { title: "Quick apology", category: "apologies", body: "I'm sorry you've had a frustrating experience. Let me help get this sorted out." },
  { title: "Specialist handoff", category: "handoffs", body: "I'm pulling in the right teammate for this now so we can get you a precise answer." },
  { title: "Follow-up check-in", category: "follow-ups", body: "Just checking back in on this. Did the last update solve the issue for you?" },
  { title: "Order-status greeting", category: "greetings", body: "Happy to help with that order. Can you share the order number so I can look it up?" },
  { title: "Escalation apology", category: "apologies", body: "You're right to flag this. I'm escalating it now and will stay with you until we have an answer." }
];
