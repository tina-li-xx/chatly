import type { BlogComparisonBlock } from "@/lib/blog-types";

export function BlogComparisonTable({ block }: { block: BlogComparisonBlock }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-700">Category</th>
            {block.columns.map((column, index) => (
              <th
                key={column}
                className={`border-b border-slate-200 px-4 py-3 font-semibold text-slate-700 ${block.highlightedColumn === index ? "bg-blue-50" : ""}`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
              <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
              {row.values.map((value, index) => (
                <td
                  key={`${row.label}-${index}-${value}`}
                  className={`px-4 py-3 text-slate-600 ${block.highlightedColumn === index ? "bg-blue-50/80" : ""}`}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
