import type { Pool } from "pg";
import {
  DEFAULT_AWAY_MESSAGE,
  DEFAULT_AWAY_TITLE,
  DEFAULT_OFFLINE_MESSAGE,
  DEFAULT_OFFLINE_TITLE
} from "@/lib/widget-settings";

export async function runSiteWidgetCopySchemaInitialization(pool: Pool) {
  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS offline_title TEXT NOT NULL DEFAULT '${DEFAULT_OFFLINE_TITLE.replace("'", "''")}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS offline_message TEXT NOT NULL DEFAULT '${DEFAULT_OFFLINE_MESSAGE.replace("'", "''")}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS away_title TEXT NOT NULL DEFAULT '${DEFAULT_AWAY_TITLE.replace("'", "''")}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ADD COLUMN IF NOT EXISTS away_message TEXT NOT NULL DEFAULT '${DEFAULT_AWAY_MESSAGE.replace("'", "''")}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN offline_title SET DEFAULT '${DEFAULT_OFFLINE_TITLE.replace("'", "''")}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN offline_message SET DEFAULT '${DEFAULT_OFFLINE_MESSAGE.replace("'", "''")}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN away_title SET DEFAULT '${DEFAULT_AWAY_TITLE.replace("'", "''")}';
  `);

  await pool.query(`
    ALTER TABLE sites
    ALTER COLUMN away_message SET DEFAULT '${DEFAULT_AWAY_MESSAGE.replace("'", "''")}';
  `);

  await pool.query(`
    UPDATE sites
    SET
      offline_title = COALESCE(NULLIF(TRIM(offline_title), ''), '${DEFAULT_OFFLINE_TITLE.replace("'", "''")}'),
      offline_message = COALESCE(NULLIF(TRIM(offline_message), ''), '${DEFAULT_OFFLINE_MESSAGE.replace("'", "''")}'),
      away_title = COALESCE(NULLIF(TRIM(away_title), ''), '${DEFAULT_AWAY_TITLE.replace("'", "''")}'),
      away_message = COALESCE(NULLIF(TRIM(away_message), ''), '${DEFAULT_AWAY_MESSAGE.replace("'", "''")}')
    WHERE
      offline_title IS NULL OR TRIM(offline_title) = '' OR
      offline_message IS NULL OR TRIM(offline_message) = '' OR
      away_title IS NULL OR TRIM(away_title) = '' OR
      away_message IS NULL OR TRIM(away_message) = '';
  `);
}
