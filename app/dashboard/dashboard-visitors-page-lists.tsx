"use client";

import { classNames, formatRelativeTime } from "@/lib/utils";
import {
  CalendarIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  GlobeIcon,
  MapPinIcon,
  PeopleIcon,
  RefreshIcon,
  SearchIcon
} from "./dashboard-ui";
import { formatDuration, type VisitorRecord, VISITORS_PAGE_SIZE } from "./visitors-data";

function PageArrow({
  disabled,
  onClick,
  children
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
    >
      {children}
    </button>
  );
}

function EmptyCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-medium text-slate-600">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function EmptyVisitorsCard({
  refreshingFilters
}: {
  refreshingFilters: boolean;
}) {
  return (
    <EmptyCard
      icon={refreshingFilters ? <SearchIcon className="h-6 w-6" /> : <CalendarIcon className="h-6 w-6" />}
      title={refreshingFilters ? "No visitors found" : "No visitors in this time range"}
      description={refreshingFilters ? "Try adjusting your search or filters." : "Try selecting a different time period."}
    />
  );
}

export function LiveVisitorsSection({
  liveVisitors,
  refreshing,
  onRefresh,
  onOpenConversation,
  onSelectVisitor
}: {
  liveVisitors: VisitorRecord[];
  refreshing: boolean;
  onRefresh: () => void;
  onOpenConversation: (visitor: VisitorRecord) => void;
  onSelectVisitor: (visitorId: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-medium text-slate-900">Live now</p>
            <p className="text-sm text-slate-500">{liveVisitors.length} visitors</p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <RefreshIcon className="h-3 w-3 animate-spin [animation-duration:2.5s]" />
            Auto-updating
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Refresh visitors"
        >
          <RefreshIcon className={classNames("h-4 w-4", refreshing && "animate-spin")} />
        </button>
      </div>

      {liveVisitors.length ? (
        <div className="grid gap-4 p-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {liveVisitors.map((visitor) => (
            <article
              key={visitor.id}
              className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-medium text-blue-700">
                    {visitor.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-slate-900">{visitor.name}</p>
                    <p className="mt-0.5 truncate text-[13px] text-slate-500">{visitor.email || "Anonymous visitor"}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-[13px] text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{visitor.location || "Unknown location"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GlobeIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{visitor.browser}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">Currently viewing</p>
                <button
                  type="button"
                  onClick={() => onSelectVisitor(visitor.id)}
                  className="mt-2 flex w-full items-center justify-between text-left text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                  <span className="truncate">{visitor.currentPage}</span>
                  <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                On site for {formatDuration(visitor.timeOnSiteSeconds)} &bull; {visitor.pagesViewed} pages viewed
              </p>

              <button
                type="button"
                onClick={() => onOpenConversation(visitor)}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg bg-blue-600 text-[13px] font-medium text-white transition hover:bg-blue-700"
              >
                Start conversation
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyCard
          icon={<PeopleIcon className="h-6 w-6" />}
          title="No one&apos;s here right now"
          description="When visitors arrive on your site, they&apos;ll appear here."
        />
      )}
    </section>
  );
}

export function RecentVisitorsSection({
  filteredVisitors,
  paginatedVisitors,
  sortKey,
  sortDirection,
  refreshingFilters,
  safeCurrentPage,
  pageCount,
  currentPage,
  onExport,
  onToggleSort,
  onOpenConversation,
  onSelectVisitor,
  setCurrentPage
}: {
  filteredVisitors: VisitorRecord[];
  paginatedVisitors: VisitorRecord[];
  sortKey: string;
  sortDirection: "asc" | "desc";
  refreshingFilters: boolean;
  safeCurrentPage: number;
  pageCount: number;
  currentPage: number;
  onExport: () => void;
  onToggleSort: (key: string) => void;
  onOpenConversation: (visitor: VisitorRecord) => void;
  onSelectVisitor: (visitorId: string) => void;
  setCurrentPage: (page: number | ((page: number) => number)) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-[15px] font-medium text-slate-900">Recent visitors</h2>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-300 px-3 text-[13px] text-slate-600 transition hover:bg-slate-50"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {filteredVisitors.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  {[
                    ["visitor", "Visitor"],
                    ["location", "Location"],
                    ["page", "Current / Last page"],
                    ["source", "Source"],
                    ["timeOnSite", "Time on site"],
                    ["lastSeen", "Last seen"]
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      className={classNames(
                        "px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.05em] text-slate-500",
                        key === "timeOnSite" || key === "lastSeen" ? "text-right" : ""
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleSort(key)}
                        className={classNames("inline-flex items-center gap-1.5", key === "timeOnSite" || key === "lastSeen" ? "ml-auto" : "")}
                      >
                        <span>{label}</span>
                        <ChevronDownIcon
                          className={classNames(
                            "h-3 w-3 transition",
                            sortKey === key ? "text-blue-600" : "text-slate-400",
                            sortKey === key && sortDirection === "asc" && "rotate-180"
                          )}
                        />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.05em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedVisitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                    onClick={() => onSelectVisitor(visitor.id)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                          {visitor.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{visitor.name}</p>
                          <p className="truncate text-[13px] text-slate-500">{visitor.email || "Anonymous visitor"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{visitor.location || "Unknown"}</td>
                    <td className="px-4 py-4">
                      <span className="block max-w-[220px] truncate font-mono text-sm text-blue-600">{visitor.currentPage}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {visitor.source === "Direct" ? <span className="italic text-slate-500">Direct</span> : visitor.source}
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-slate-600">{formatDuration(visitor.timeOnSiteSeconds)}</td>
                    <td className="px-4 py-4 text-right text-sm">
                      {visitor.online ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Online
                        </span>
                      ) : (
                        <span className="text-slate-600">{formatRelativeTime(visitor.lastSeenAt)}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpenConversation(visitor);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                          aria-label={`Open conversation with ${visitor.name}`}
                        >
                          <ChatBubbleIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectVisitor(visitor.id);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                          aria-label={`View details for ${visitor.name}`}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              Showing {(safeCurrentPage - 1) * VISITORS_PAGE_SIZE + 1}-
              {Math.min(safeCurrentPage * VISITORS_PAGE_SIZE, filteredVisitors.length)} of {filteredVisitors.length} visitors
            </p>

            <div className="flex items-center gap-1">
              <PageArrow disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                <ChevronLeftIcon className="h-4 w-4" />
              </PageArrow>

              {Array.from({ length: Math.min(pageCount, 5) }, (_, index) => {
                const pageNumber = index + 1;

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={classNames(
                      "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition",
                      currentPage === pageNumber
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <PageArrow disabled={safeCurrentPage === pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}>
                <ChevronRightIcon className="h-4 w-4" />
              </PageArrow>
            </div>
          </div>
        </>
      ) : (
        <EmptyVisitorsCard refreshingFilters={refreshingFilters} />
      )}
    </section>
  );
}
