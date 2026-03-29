import { sendStyledTrialExtensionOutreachEmail } from "@/lib/chatly-marketing-email-senders";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export async function sendTrialExtensionOutreachEmail(input: {
  to: string;
  planName: string;
  trialEndsAt: string;
}) {
  const formattedEndDate = formatDate(input.trialEndsAt);

  await sendStyledTrialExtensionOutreachEmail({
    to: input.to,
    planName: input.planName,
    formattedEndDate
  });
}
