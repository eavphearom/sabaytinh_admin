import Table from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import { Edit2, Search, Trash2 } from "lucide-react";
import Input from "../../../components/ui/Input";
import TablePagination from "../../../components/ui/TablePagination";

export default function ColorList({
  colors,
  loading = false,
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
}) {
  const firstItem = totalItems === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + colors.length, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  // Custom cells preserve feature UI; Table owns rows, keys and empty states.
  const columns = [
    {
      key: "selection", label: (<input type="checkbox" aria-label="Select all colors" />),
      width: 48,
      render: (_, color) => (<><input type="checkbox" aria-label={`Select ${color.name}`} /></>),
    },
    {
      key: "number", label: "#",
      width: 64,
      cellClassName: "text-[#64748B]",
      render: (_, color, index) => (<>{startIndex + index + 1}</>),
    },
    {
      key: "color_name", label: "Color Name",
      cellClassName: "font-semibold text-[#03152B]",
      render: (_, color) => (<>{color.name}</>),
    },
    {
      key: "color_code", label: "Color Code",
      render: (_, color) => (<><div className="flex items-center gap-2 font-semibold text-[#03152B]">
                    <span
                      className="h-5 w-5 rounded-full border border-[#D7DFEA]"
                      style={{ backgroundColor: color.colorCode }}
                    />
                    {color.colorCode}
                  </div></>),
    },
    {
      key: "created_date", label: "Created Date",
      cellClassName: "text-[#64748B]",
      render: (_, color) => (<>{color.createdAt}</>),
    },
    {
      key: "actions", label: "Actions",
      align: "right",
      render: (_, color) => (<><Actions item={color} onEdit={onEdit} onDelete={onDelete} /></>),
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
            placeholder="Search color..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
      </div>

      {/* Search and pagination stay in the feature; Table only renders the current page. */}
      <Table
        columns={columns}
        data={colors}
        rowKey="id"
        label="Colors"
        loading={loading}
        loadingMessage="Loading colors..."
        emptyMessage="No colors found."
        minWidth={720}
        className="!rounded-none !border-0"
      />

      <TablePagination
        firstItem={firstItem}
        lastItem={lastItem}
        totalItems={totalItems}
        label="colors"
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


function Actions({ item, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        onClick={() => onEdit(item)}
        variant="ghostBrand" size="iconSm"
        aria-label={`Edit ${item.name}`}
      >
        <Edit2 size={15} />
      </Button>
      <Button
        type="button"
        onClick={() => onDelete(item)}
        variant="ghostDanger" size="iconSm"
        aria-label={`Delete ${item.name}`}
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
