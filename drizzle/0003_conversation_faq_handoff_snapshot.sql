ALTER TABLE "conversations"
	ADD COLUMN IF NOT EXISTS "faq_handoff_suggestions_json" text;
