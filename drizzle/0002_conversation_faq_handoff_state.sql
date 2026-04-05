ALTER TABLE "conversations"
	ADD COLUMN IF NOT EXISTS "faq_handoff_pending" boolean DEFAULT false NOT NULL;

ALTER TABLE "conversations"
	ADD COLUMN IF NOT EXISTS "faq_handoff_preview" text;

ALTER TABLE "conversations"
	ADD COLUMN IF NOT EXISTS "faq_handoff_attachments_count" integer DEFAULT 0 NOT NULL;

ALTER TABLE "conversations"
	ADD COLUMN IF NOT EXISTS "faq_handoff_is_new_visitor" boolean DEFAULT false NOT NULL;

ALTER TABLE "conversations"
	ADD COLUMN IF NOT EXISTS "faq_handoff_high_intent" boolean DEFAULT false NOT NULL;
