import { code, cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingWebhooksIntegrationGuideSections = [
  section("why", "When to use webhooks instead of Zapier", [
    paragraph("Webhooks are the right choice when your team already has its own backend, queue, or automation service and wants raw Chatting events delivered straight to an HTTPS endpoint."),
    paragraph("Compared with Zapier, webhooks give you more control over signing, retries, and the exact system that should process each event.")
  ]),
  section("events", "Which events Chatting can send", [
    list([
      "`conversation.created`",
      "`conversation.resolved`",
      "`conversation.assigned`",
      "`message.received`",
      "`contact.created`",
      "`contact.updated`",
      "`tag.added`"
    ]),
    paragraph("Choose only the events your endpoint actually needs. That keeps the payload stream cleaner and makes webhook debugging much easier.")
  ]),
  section("setup", "How to add a webhook endpoint", [
    list([
      "Open Settings → Integrations → Webhooks in Chatting",
      "Add an HTTPS endpoint URL",
      "Choose which events to send",
      "Optionally add a signing secret",
      "Save the endpoint and run a test delivery"
    ], true),
    paragraph("Chatting only accepts secure HTTPS endpoints here, which helps avoid accidentally sending customer event data to an unsafe destination.")
  ]),
  section("signing", "How to verify signatures", [
    paragraph("If you save a secret, Chatting signs payloads so your backend can verify the request before processing it."),
    paragraph("Use the `X-Chatting-Signature` header and compare it against a signature you compute with the same secret on your side."),
    code("POST /webhooks/chatting\nX-Chatting-Signature: <computed-signature>\nContent-Type: application/json", "http")
  ]),
  section("testing", "How to test and debug", [
    list([
      "Use the Test button after saving the endpoint",
      "Check the last response summary in Chatting",
      "Open the saved response body when a test fails",
      "Keep your endpoint fast and queue longer work asynchronously"
    ]),
    paragraph("That last step matters. Webhook endpoints should acknowledge quickly, then move heavier processing into your own worker or queue.")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Can we send webhooks to any URL?",
        answer: "Only to HTTPS endpoints. Chatting blocks insecure URLs during setup."
      },
      {
        question: "Do we have to use a signing secret?",
        answer: "No, but you should if the endpoint does anything important with customer or conversation data."
      },
      {
        question: "What should we do if a webhook test fails?",
        answer: "Use the saved response details in Chatting first, then confirm the endpoint URL, event selection, and signature verification logic."
      }
    ]),
    cta(
      "Need raw events in your own backend?",
      "Open the Webhooks page in Chatting and add one HTTPS endpoint first before you widen the event set.",
      "Open Chatting",
      "/login"
    )
  ])
];
