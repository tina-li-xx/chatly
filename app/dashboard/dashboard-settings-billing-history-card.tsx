"use client";

import { useMemo, useState } from "react";
import { getBillingPlanDefinition } from "@/lib/billing-plans";
import type { DashboardBillingInvoice } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";
import { billingPeriodLabel, invoiceStatusMeta, type BillingHistorySortKey } from "./dashboard-billing-utils";
import { formatMoney, SettingsCard } from "./dashboard-settings-shared";
import { ChevronDownIcon, CreditCardIcon, DownloadIcon, ExternalLinkIcon } from "./dashboard-ui";

function invoiceSortValue(invoice: DashboardBillingInvoice, sortKey: BillingHistorySortKey) {
  switch (sortKey) {
    case "amount":
      return invoice.amountCents;
    case "description":
      return invoice.description.toLowerCase();
    case "status":
      return invoice.status;
    case "date":
    default:
      return new Date(invoice.issuedAt).getTime();
  }
}

export function DashboardSettingsBillingHistoryCard({
  invoices
}: {
  invoices: DashboardBillingInvoice[];
}) {
  const [sortKey, setSortKey] = useState<BillingHistorySortKey>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((left, right) => {
      const leftValue = invoiceSortValue(left, sortKey);
      const rightValue = invoiceSortValue(right, sortKey);
      const comparison = leftValue > rightValue ? 1 : leftValue < rightValue ? -1 : 0;
      return sortDirection === "asc" ? comparison : comparison * -1;
    });
  }, [invoices, sortDirection, sortKey]);
  const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / pageSize));
  const visibleInvoices = sortedInvoices.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(nextKey: BillingHistorySortKey) {
    setPage(1);
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection(nextKey === "description" || nextKey === "status" ? "asc" : "desc");
  }

  return (
    <SettingsCard title="Billing history" description={`Sorted ${sortDirection === "asc" ? "ascending" : "descending"} · ${billingPeriodLabel()}`}>
      {invoices.length ? (
        <div className="space-y-4">
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    ["date", "Date"],
                    ["description", "Description"],
                    ["amount", "Amount"],
                    ["status", "Status"]
                  ].map(([value, label]) => (
                    <th key={value} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <button type="button" onClick={() => toggleSort(value as BillingHistorySortKey)} className="inline-flex items-center gap-1">
                        {label}
                        <ChevronDownIcon className={`h-3.5 w-3.5 transition ${sortKey === value && sortDirection === "asc" ? "rotate-180" : ""}`} />
                      </button>
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleInvoices.map((invoice) => {
                  const status = invoiceStatusMeta(invoice.status);
                  return (
                    <tr key={invoice.id} className="border-t border-slate-100 text-sm text-slate-700">
                      <td className="px-5 py-4 font-medium text-slate-900">{formatDateTime(invoice.issuedAt)}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{invoice.description}</p>
                        <p className="mt-1 text-[13px] text-slate-500">
                          {getBillingPlanDefinition(invoice.planKey).name}
                          {invoice.billingInterval ? ` · ${invoice.billingInterval}` : ""}
                          {invoice.seatQuantity ? ` · ${invoice.seatQuantity} seat${invoice.seatQuantity === 1 ? "" : "s"}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">{formatMoney(invoice.amountCents, invoice.currency)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.invoicePdfUrl ? (
                            <a href={invoice.invoicePdfUrl} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                              <DownloadIcon className="h-4 w-4" />
                            </a>
                          ) : null}
                          {invoice.hostedInvoiceUrl ? (
                            <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                              <ExternalLinkIcon className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {visibleInvoices.map((invoice) => {
              const status = invoiceStatusMeta(invoice.status);
              return (
                <div key={invoice.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{invoice.description}</p>
                      <p className="mt-1 text-sm text-slate-500">{formatDateTime(invoice.issuedAt)}</p>
                    </div>
                    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-900">{formatMoney(invoice.amountCents, invoice.currency)}</p>
                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                    {invoice.invoicePdfUrl ? (
                      <a
                        href={invoice.invoicePdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Download invoice PDF"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </a>
                    ) : null}
                    {invoice.hostedInvoiceUrl ? (
                      <a
                        href={invoice.hostedInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="View invoice"
                      >
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-sm text-slate-500">
              <span>
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedInvoices.length)} of {sortedInvoices.length} invoices
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700" disabled={page === 1}>
                  Prev
                </button>
                <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700" disabled={page === totalPages}>
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <CreditCardIcon className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 text-base font-medium text-slate-600">No billing history yet</p>
          <p className="mt-1 text-sm text-slate-400">Your invoices will appear here after the first paid billing event.</p>
        </div>
      )}
    </SettingsCard>
  );
}
