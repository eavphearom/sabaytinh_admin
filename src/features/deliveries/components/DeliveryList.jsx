import { Edit2, Image, Search, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Table from "../../../components/ui/Table";
import TablePagination from "../../../components/ui/TablePagination";

// Table presentation stays separate from manual API and modal state.
export default function DeliveryList({
  deliveries, search, onSearch, page, perPage, totalItems, totalPages,
  startIndex, onPageChange, handlePerPageChange, loading, onEdit, onDelete, busy,
}) {
  const columns = [
    { key: "no", label: "No", render: (_, row, index) => startIndex + index + 1 },
    { key: "logo", label: "Logo", render: (value, row) => (
      <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#F97316]">
        {value ? <img src={value} alt={row.name} className="h-full w-full object-contain" /> : <Image size={20} />}
      </div>
    ) },
    { key: "name", label: "Name", cellClassName: "font-semibold text-[#03152B]" },
    { key: "fee", label: "Fee", render: (value) => value == null ? "-" : Number(value).toFixed(2) },
    { key: "estimated_min_days", label: "Min Days" },
    { key: "estimated_max_days", label: "Max Days" },
    { key: "actions", label: "Actions", align: "right", render: (_, row) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghostBrand" size="iconSm" disabled={busy} onClick={() => onEdit(row)}
          aria-label={`Edit ${row.name}`} title="Edit"><Edit2 size={15} /></Button>
        <Button variant="ghostDanger" size="iconSm" disabled={busy} onClick={() => onDelete(row)}
          aria-label={`Delete ${row.name}`} title="Delete"><Trash2 size={15} /></Button>
      </div>
    ) },
  ];
  // Keep pagination compact on phones even when the server has many pages.
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index);
  return (
    <div className="min-w-0 rounded-lg border border-[#D7DFEA] bg-white shadow-sm">
      {/* Search only: delivery methods do not have a status filter. */}
      <div className="border-b border-[#E5EAF1] p-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AA]" />
          <Input aria-label="Search delivery methods" placeholder="Search delivery..."
            value={search} onChange={(event) => onSearch(event.target.value)} className="h-9 pl-9" />
        </div>
      </div>
      <Table columns={columns} data={deliveries} rowKey="id" label="Delivery methods"
        loading={loading} emptyMessage="No delivery methods found."
        loadingMessage="Loading delivery methods..." className="!rounded-none !border-0" />
      <TablePagination firstItem={deliveries.length ? startIndex + 1 : 0}
        lastItem={deliveries.length ? Math.min(startIndex + deliveries.length, totalItems) : 0}
        totalItems={totalItems} label="delivery methods" page={page} pages={pages}
        totalPages={totalPages} perPage={perPage} onPageChange={onPageChange}
        handlePerPageChange={handlePerPageChange} />
    </div>
  );
}
