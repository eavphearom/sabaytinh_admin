import { Fragment } from "react";

const alignment = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Columns support render(value, item, index) for images, badges, and actions.
export default function Table({
  columns = [],
  data = [],
  renderRow,
  rowKey = "id",
  loading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No records found.",
  minWidth = 680,
  label = "Data table",
  caption,
  className = "",
  tableClassName = "",
  rowClassName = "",
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={"max-w-full min-w-0 overflow-x-auto rounded-lg border border-[#D7DFEA] bg-white focus-visible:outline-2 focus-visible:outline-[#F97316] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " + className}
    >
      <table
        aria-busy={loading}
        className={"w-full " + tableClassName}
        style={{ minWidth }}
      >
        <caption className="sr-only">{caption || label}</caption>
        <thead>
          <tr className="border-b border-[#E5EAF1] bg-[#F8FAFD] text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                style={{ width: column.width }}
                className={"px-4 py-3 " + (alignment[column.align] || alignment.left) + " " + (column.headerClassName || "")}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={Math.max(1, columns.length)} className="px-4 py-8 text-center text-sm text-[#64748B]">
                <span role="status">{loading ? loadingMessage : emptyMessage}</span>
              </td>
            </tr>
          ) : data.map((item, index) => {
            const customRow = renderRow?.(item, index);
            // Use a record ID (or custom rowKey), never its changing list position.
            const key = typeof rowKey === "function" ? rowKey(item) : item[rowKey];
            if (key == null && customRow?.key == null) {
              throw new Error("Table rows need a unique id, rowKey, or keyed renderRow result.");
            }
            if (renderRow) return <Fragment key={key ?? customRow.key}>{customRow}</Fragment>;
            return (
              <tr
                key={key}
                className={"border-b border-[#EEF2F7] text-sm text-[#03152B] transition last:border-0 hover:bg-[#F8FAFD] " + (typeof rowClassName === "function" ? rowClassName(item, index) : rowClassName)}
              >
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={"px-4 py-3 " + (alignment[column.align] || alignment.left) + " " + (column.cellClassName || "")}
                  >
                    {column.render ? column.render(item[column.key], item, index) : (item[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
