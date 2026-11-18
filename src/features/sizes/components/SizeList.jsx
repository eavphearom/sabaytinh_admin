import Table from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import { Edit2, Search, Trash2 } from "lucide-react";
import Input from "../../../components/ui/Input";
import TablePagination from "../../../components/ui/TablePagination";

export default function SizeList({
  sizes,
  search,
  onSearch,
  page,
  totalPages,
  totalItems,
  startIndex,
  perPage,
  handlePerPageChange,
  onPageChange,
  onEdit,
  onDelete,
  loading = false,
}) {
  const firstItem = totalItems === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + sizes.length, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  // Custom cells preserve feature UI; Table owns rows, keys and empty states.
  const columns = [
    {
      key: "selection",
      label: <input type="checkbox" aria-label="Select all sizes" />,
      width: 48,
      render: (_, size) => (
        <>
          <input type="checkbox" aria-label={`Select ${size.value}`} />
        </>
      ),
    },
    {
      key: "number",
      label: "#",
      width: 64,
      cellClassName: "text-[#64748B]",
      render: (_, size, index) => <>{startIndex + index + 1}</>,
    },
    {
      key: "size",
      label: "Size",
      render: (_, size) => (
        <>
          <span className="inline-flex rounded-md border border-[#D7DFEA] bg-[#F8FAFD] px-2.5 py-1 text-sm font-semibold text-[#03152B]">
            {size.value}
          </span>
        </>
      ),
    },
    {
      key: "description",
      label: "Description",
      cellClassName: "text-[#64748B]",
      render: (_, size) => <>{size.description || "-"}</>,
    },
    {
      key: "status",
      label: "Status",
      render: (_, size) => (
        <>
          <StatusBadge status={size.status} />
        </>
      ),
    },
    {
      key: "created_date",
      label: "Created Date",
      cellClassName: "text-[#64748B]",
      render: (_, size) => <>{size.createdAt}</>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, size) => (
        <>
          <Actions item={size} onEdit={onEdit} onDelete={onDelete} />
        </>
      ),
    },
  ];

  return (
    <div className="rounded-lg border border-[#D7DFEA] bg-white shadow-sm">
      <div className="border-b border-[#E5EAF1] p-4">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AA]"
          />
          <Input
            placeholder="Search size..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
      </div>

      {/* Search and pagination stay in the feature; Table only renders the current page. */}
      <Table
        columns={columns}
        data={sizes}
        rowKey="id"
        label="Sizes"
        loading={loading}
        loadingMessage="Loading sizes..."
        emptyMessage="No sizes found."
        minWidth={680}
        className="!rounded-none !border-0"
      />

      <TablePagination
        firstItem={firstItem}
        lastItem={lastItem}
        totalItems={totalItems}
        label="sizes"
        page={page}
        pages={pages}
        totalPages={totalPages}
        perPage={perPage}
        onPageChange={onPageChange}
        handlePerPageChange={handlePerPageChange}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
        status === "Active"
          ? "bg-[#DCFCE7] text-[#15803D]"
          : "bg-[#F1F5F9] text-[#64748B]"
      }`}
    >
      {status}
    </span>
  );
}

function Actions({ item, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        onClick={() => onEdit(item)}
        variant="ghostBrand"
        size="iconSm"
        aria-label={`Edit ${item.value}`}
      >
        <Edit2 size={15} />
      </Button>
      <Button
        type="button"
        onClick={() => onDelete(item)}
        variant="ghostDanger"
        size="iconSm"
        aria-label={`Delete ${item.value}`}
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
