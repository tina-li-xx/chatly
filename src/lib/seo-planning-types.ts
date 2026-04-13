export type SeoPlanRunStatus =
  | "draft"
  | "generating"
  | "ready"
  | "failed"
  | "archived";

export type SeoPlanItemStatus =
  | "planned"
  | "drafted"
  | "skipped"
  | "archived";

export type SeoGeneratedDraftStatus =
  | "draft"
  | "ready_for_review"
  | "approved"
  | "scheduled"
  | "archived";

export type SeoGeneratedDraftPublicationStatus =
  | "draft"
  | "scheduled"
  | "published";
