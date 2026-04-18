ALTER TABLE "conversations"
  ADD COLUMN IF NOT EXISTS "recorded_page_url" text,
  ADD COLUMN IF NOT EXISTS "recorded_referrer" text,
  ADD COLUMN IF NOT EXISTS "recorded_user_agent" text,
  ADD COLUMN IF NOT EXISTS "recorded_country" text,
  ADD COLUMN IF NOT EXISTS "recorded_region" text,
  ADD COLUMN IF NOT EXISTS "recorded_city" text,
  ADD COLUMN IF NOT EXISTS "recorded_timezone" text,
  ADD COLUMN IF NOT EXISTS "recorded_locale" text,
  ADD COLUMN IF NOT EXISTS "last_message_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "last_message_preview" text;

UPDATE conversations AS c
SET
  recorded_page_url = COALESCE(c.recorded_page_url, cm.page_url),
  recorded_referrer = cm.referrer,
  recorded_user_agent = cm.user_agent,
  recorded_country = COALESCE(cm.country, c.recorded_country),
  recorded_region = COALESCE(cm.region, c.recorded_region),
  recorded_city = COALESCE(cm.city, c.recorded_city),
  recorded_timezone = COALESCE(cm.timezone, c.recorded_timezone),
  recorded_locale = COALESCE(cm.locale, c.recorded_locale)
FROM conversation_metadata AS cm
WHERE cm.conversation_id = c.id;

WITH latest_messages AS (
  SELECT DISTINCT ON (m.conversation_id)
    m.conversation_id,
    m.created_at,
    m.content
  FROM messages AS m
  ORDER BY m.conversation_id, m.created_at DESC
)
UPDATE conversations AS c
SET
  last_message_at = latest.created_at,
  last_message_preview = latest.content
FROM latest_messages AS latest
WHERE latest.conversation_id = c.id;
