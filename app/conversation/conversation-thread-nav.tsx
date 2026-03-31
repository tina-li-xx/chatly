type ConversationThreadNavProps = {
  brandingLabel: string;
  brandingUrl: string;
  brandColor: string;
  showBranding: boolean;
  teamPhotoUrl: string | null;
  widgetTitle: string;
};

export function ConversationThreadNav({
  brandingLabel,
  brandingUrl,
  brandColor,
  showBranding,
  teamPhotoUrl,
  widgetTitle
}: ConversationThreadNavProps) {
  return (
    <nav className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        {teamPhotoUrl ? (
          <img src={teamPhotoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
            style={{ backgroundColor: brandColor }}
          >
            {(widgetTitle.trim()[0] || "C").toUpperCase()}
          </div>
        )}
        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Conversation</p>
          <h1 className="display-font mt-1 truncate text-2xl text-slate-900">{widgetTitle}</h1>
        </div>
      </div>
      {showBranding ? (
        <a
          href={brandingUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4"
        >
          {brandingLabel}
        </a>
      ) : null}
    </nav>
  );
}
