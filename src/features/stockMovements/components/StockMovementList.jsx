import { Search } from "lucide-react";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Table from "../../../components/ui/Table";
import TablePagination from "../../../components/ui/TablePagination";

// Safely display API values, including zero quantities and nested metadata.
function formatValue(value) {
  if (value == null || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Keep API field names separate from the visible column labels.
const movementFields = [
  ["product_code", "Product Code"],
  ["product_name", "Product Name"],
  ["sku_prefix", "Variant Code"],
  ["color", "Color"],
  ["size", "Size"],
  ["type", "Type"],
  ["qty_change", "Qty Change"],
  ["multiplier", "Multiplier"],
  ["base_qty_change", "Base Qty Change"],
  ["qty_before", "Old Stock"],
  ["qty_after", "New Stock"],
  ["reference_type", "Reference Type"],
  ["note", "Note"],
  ["created_at", "Created At"],
];

// Render read-only history using the shared table and server-side Type filter.
export default function StockMovementList({
  rows,
  search,
  onSearch,
  type,
  onTypeChange,
  typeOptions,
  page,
  perPage,
  totalItems,
  totalPages,
  startIndex,
  onPageChange,
  onPerPageChange,
  loading,
}) {
  const columns = [
    // Row numbers continue acrDoss pages instead of displaying database IDs.
    {
      key: "no",
      label: "No",
      render: (_, row, index) => startIndex + index + 1,
    },
    ...movementFields.map(([key, label]) => ({
      key,
      label,
      render: (value) => (
        <span
          className={
            key === "note"
              ? "block w-64 whitespace-normal break-words"
              : "whitespace-nowrap"
          }
        >
          {formatValue(value)}
        </span>
      ),
    })),
  ];
  // Limit visible page buttons so large histories still fit small screens.
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstPage + index,
  );

  return (
    <div className="min-w-0 rounded-lg border border-[#D7DFEA] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5EAF1] p-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AA]"
          />
          <Input
            aria-label="Search stock movements"
            placeholder="Search stock movement..."
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={type}
            options={typeOptions}
            placeholder=""
            onChange={(event) => onTypeChange(event.target.value)}
          />
        </div>
      </div>
      <Table
        columns={columns}
        data={rows}
        rowKey="id"
        label="Stock movements"
        minWidth={1800}
        loading={loading}
        loadingMessage="Loading stock movements..."
        emptyMessage="No stock movements found."
        className="!rounded-none !border-0"
      />
      <TablePagination
        firstItem={rows.length ? startIndex + 1 : 0}
        lastItem={
          rows.length ? Math.min(startIndex + rows.length, totalItems) : 0
        }
        totalItems={totalItems}
        label="stock movements"
        page={page}
        pages={pages}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </div>
  );
}
