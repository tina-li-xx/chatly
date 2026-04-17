export type ChattingZapierStarterWorkflow = {
  id: string;
  name: string;
  description: string;
  recipe: string;
  templateName: string;
  templateDescription: string;
};

export const CHATTING_ZAPIER_SETUP_GUIDE_PATH = "/guides/chatting-zapier-integration";
export const CHATTING_ZAPIER_API_REFERENCE_PATH =
  "/guides/chatting-zapier-api-reference";
export const CHATTING_ZAPIER_STARTER_ZAPS_GUIDE_PATH =
  "/guides/chatting-zapier-starter-zaps";
export const CHATTING_ZAPIER_SUPPORT_URL = "https://zapier.com/app/get-help";

export const CHATTING_ZAPIER_STARTER_WORKFLOWS: ChattingZapierStarterWorkflow[] = [
  {
    id: "new-conversation-slack-alert",
    name: "New conversation alerts in Slack",
    description:
      "Send every new Chatting conversation into Slack so the team can triage and reply faster.",
    recipe: "Chatting: New conversation -> Slack: Send channel message",
    templateName: "Send new Chatting conversations to Slack",
    templateDescription:
      "Post each new Chatting conversation to a Slack channel so your team can triage and respond faster."
  },
  {
    id: "new-contact-google-sheets-log",
    name: "New contact logging in Google Sheets",
    description:
      "Append every new Chatting contact to a shared sheet for lightweight lead tracking.",
    recipe: "Chatting: New contact -> Google Sheets: Create spreadsheet row",
    templateName: "Log new Chatting contacts in Google Sheets",
    templateDescription:
      "Create a spreadsheet row for every new Chatting contact so your team keeps a lightweight lead log."
  },
  {
    id: "google-sheets-create-and-tag-contact",
    name: "Imported leads created and tagged in Chatting",
    description:
      "Turn each new spreadsheet row into a Chatting contact and immediately apply the right tag.",
    recipe:
      "Google Sheets: New spreadsheet row -> Chatting: Create contact -> Chatting: Add tag to contact",
    templateName: "Create and tag Chatting contacts from Google Sheets rows",
    templateDescription:
      "Create a Chatting contact from each new spreadsheet row and add a tag so follow-up starts organized."
  },
  {
    id: "new-conversation-auto-reply",
    name: "Automatic first reply on new conversations",
    description:
      "Send an instant acknowledgement back into a new Chatting conversation when a visitor starts chatting.",
    recipe: "Chatting: New conversation -> Chatting: Send message",
    templateName: "Send an automatic first reply in Chatting",
    templateDescription:
      "Reply instantly when a new Chatting conversation starts so visitors get an acknowledgement right away."
  }
];
