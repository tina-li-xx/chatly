"use client";

import { useMemo, useState } from "react";
import { FormInput, FormSelect } from "../../ui/form-controls";
import { responseTemplates, type ResponseTemplateCategory } from "@/lib/response-template-library";

const categories: Array<{ value: "all" | ResponseTemplateCategory; label: string }> = [
  { value: "all", label: "All" },
  { value: "greetings", label: "Greetings" },
  { value: "apologies", label: "Apologies" },
  { value: "handoffs", label: "Handoffs" },
  { value: "follow-ups", label: "Follow-ups" }
];

export function ResponseTemplateLibraryTool() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ResponseTemplateCategory>("all");
  const filtered = useMemo(
    () =>
      responseTemplates.filter((template) => {
        const matchesCategory = category === "all" || template.category === category;
        const matchesQuery = `${template.title} ${template.body}`.toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [category, query]
  );

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <FormInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search templates..." />
        <FormSelect value={category} onChange={(event) => setCategory(event.target.value as "all" | ResponseTemplateCategory)}>
          {categories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </FormSelect>
      </div>
      <div className="mt-6 space-y-4">
        {filtered.map((template) => (
          <article key={template.title} className="rounded-[18px] border border-slate-200 bg-slate-50 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{template.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{template.body}</p>
              </div>
              <button type="button" onClick={() => navigator.clipboard.writeText(template.body)} className="text-sm font-semibold text-blue-600">
                Copy
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
