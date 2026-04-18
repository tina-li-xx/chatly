ALTER TABLE "conversation_reads"
  ADD COLUMN IF NOT EXISTS "unread_count" integer NOT NULL DEFAULT 0;

WITH existing_unread_counts AS (
  SELECT
    cr.user_id,
    cr.conversation_id,
    COUNT(m.id)::int AS unread_count
  FROM conversation_reads AS cr
  LEFT JOIN messages AS m
    ON m.conversation_id = cr.conversation_id
   AND m.sender = 'user'
   AND m.created_at > COALESCE(cr.last_read_at, TO_TIMESTAMP(0))
  GROUP BY cr.user_id, cr.conversation_id
)
UPDATE conversation_reads AS cr
SET unread_count = existing_unread_counts.unread_count
FROM existing_unread_counts
WHERE existing_unread_counts.user_id = cr.user_id
  AND existing_unread_counts.conversation_id = cr.conversation_id;

WITH conversation_scope AS (
  SELECT
    c.id AS conversation_id,
    s.user_id AS owner_user_id,
    c.assigned_user_id
  FROM conversations AS c
  INNER JOIN sites AS s
    ON s.id = c.site_id
),
target_users AS (
  SELECT DISTINCT
    target.user_id,
    scope.conversation_id
  FROM conversation_scope AS scope
  CROSS JOIN LATERAL (
    SELECT scope.owner_user_id AS user_id

    UNION ALL

    SELECT tm.member_user_id AS user_id
    FROM team_memberships AS tm
    WHERE tm.owner_user_id = scope.owner_user_id
      AND tm.status = 'active'
      AND tm.role = 'admin'

    UNION ALL

    SELECT scope.assigned_user_id AS user_id
  ) AS target
  WHERE target.user_id IS NOT NULL
),
missing_targets AS (
  SELECT
    target_users.user_id,
    target_users.conversation_id
  FROM target_users
  LEFT JOIN conversation_reads AS cr
    ON cr.user_id = target_users.user_id
   AND cr.conversation_id = target_users.conversation_id
  WHERE cr.user_id IS NULL
),
missing_unread_counts AS (
  SELECT
    missing_targets.user_id,
    missing_targets.conversation_id,
    COUNT(m.id)::int AS unread_count
  FROM missing_targets
  LEFT JOIN messages AS m
    ON m.conversation_id = missing_targets.conversation_id
   AND m.sender = 'user'
  GROUP BY missing_targets.user_id, missing_targets.conversation_id
)
INSERT INTO conversation_reads (user_id, conversation_id, last_read_at, unread_count, updated_at)
SELECT
  missing_unread_counts.user_id,
  missing_unread_counts.conversation_id,
  TO_TIMESTAMP(0),
  missing_unread_counts.unread_count,
  NOW()
FROM missing_unread_counts
WHERE missing_unread_counts.unread_count > 0;
