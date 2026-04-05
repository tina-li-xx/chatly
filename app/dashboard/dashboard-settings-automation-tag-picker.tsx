"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "../components/ui/Input";
import { CheckIcon, ChevronDownIcon, PlusIcon, SearchIcon } from "./dashboard-ui";
import { filterTagOptions } from "./dashboard-settings-automation-tag-picker-helpers";
import { classNames } from "@/lib/utils";

export function AutomationTagPicker({
  value,
  options,
  primaryOptions = [],
  secondaryOptions = [],
  inputId,
  hasError,
  placeholder,
  onChange
}: {
  value: string;
  options: string[];
  primaryOptions?: string[];
  secondaryOptions?: string[];
  inputId?: string;
  hasError?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const normalizedValue = value.trim().toLowerCase();

  const groups = useMemo(() => {
    const visiblePrimary = filterTagOptions(primaryOptions, normalizedValue, normalizedValue ? 6 : 4);
    const visibleSecondary = filterTagOptions(
      secondaryOptions.length ? secondaryOptions : options,
      normalizedValue,
      normalizedValue ? 8 : 6
    );

    return [
      { title: "Workspace tags", items: visiblePrimary.items, hiddenCount: visiblePrimary.hiddenCount },
      { title: "Suggested tags", items: visibleSecondary.items, hiddenCount: visibleSecondary.hiddenCount }
    ].filter((group) => group.items.length);
  }, [normalizedValue, options, primaryOptions, secondaryOptions]);

  const hasExactMatch = options.some((option) => option.toLowerCase() === normalizedValue);
  const shouldShowCreateOption = Boolean(value.trim()) && !hasExactMatch;
  const hiddenCount = groups.reduce((count, group) => count + group.hiddenCount, 0);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Input
          id={inputId}
          value={value}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            onChange(event.currentTarget.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className={classNames(
            "h-10 rounded-md pr-10",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-100"
          )}
        />
        <button
          type="button"
          aria-label="Toggle tag suggestions"
          onClick={() => setIsOpen((current) => !current)}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        >
          <ChevronDownIcon className={classNames("h-4 w-4 transition", isOpen && "rotate-180")} />
        </button>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          <div className="flex items-start gap-3 border-b border-slate-100 px-3 py-3">
            <div className="rounded-full bg-slate-100 p-2 text-slate-500">
              <SearchIcon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {normalizedValue ? "Matching tags" : "Suggested tags"}
              </p>
              <p className="text-xs text-slate-500">
                {normalizedValue ? "Choose a tag or create a new one." : "Pick a clean label for this routing rule."}
              </p>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {shouldShowCreateOption ? (
              <PickerRow
                label={`Create "${value.trim()}"`}
                tone="create"
                active={false}
                onSelect={() => {
                  onChange(value.trim());
                  setIsOpen(false);
                }}
              />
            ) : null}

            {groups.length ? (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {group.title}
                    </p>
                    {group.items.map((option) => (
                      <PickerRow
                        key={option}
                        label={option}
                        active={option === value}
                        onSelect={() => {
                          onChange(option);
                          setIsOpen(false);
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">No matching tags yet.</p>
            )}
          </div>

          {!normalizedValue && hiddenCount > 0 ? (
            <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
              +{hiddenCount} more suggestions available when you start typing.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PickerRow({
  label,
  tone = "default",
  active,
  onSelect
}: {
  label: string;
  tone?: "default" | "create";
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={classNames(
        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition",
        active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
      )}
    >
      <span
        className={classNames(
          "inline-flex min-w-0 max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-medium",
          tone === "create"
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : active
              ? "border-blue-200 bg-white text-blue-700"
              : "border-slate-200 bg-slate-50 text-slate-700"
        )}
      >
        {tone === "create" ? <PlusIcon className="mr-1.5 h-3.5 w-3.5 shrink-0" /> : null}
        <span className="truncate">{label}</span>
      </span>
      {active ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
    </button>
  );
}
