import { Edit2, Image, MoreHorizontal, Search, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Input from "../../../components/ui/Input";
import TablePagination from "../../../components/ui/TablePagination";

export default function CategoryList({
  categories,
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
  const lastItem = Math.min(startIndex + categories.length, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  // Category-specific cells are passed to the reusable Table component.
  const columns = [
    // Keep row numbers continuous across API pages.
    { key: "number", label: "#", width: 64, cellClassName: "text-[#64748B]", render: (_, item, index) => startIndex + index + 1 },
    { key: "image", label: "Image", width: 96, render: (src, item) => (
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-[#FFF7ED] text-[#F97316]">
        {/* Missing or failed images reveal this placeholder. */}
        <Image size={20} aria-label="No category image" />
        {src && <img key={src} src={src} alt={item.name} loading="lazy" className="absolute inset-0 h-full w-full bg-white object-contain" onError={event => { event.currentTarget.hidden = true; }} />}
      </div>
    ) },
    { key: "name", label: "Category Name", cellClassName: "font-semibold" },
    { key: "description", label: "Description", cellClassName: "text-[#64748B]", render: value => value || "-" },
    { key: "status", label: "Status", render: value => {
      const status = value || "Active";
      return <span className={"inline-flex rounded-md px-2 py-1 text-xs font-semibold " + (status === "Active" ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#F1F5F9] text-[#64748B]")}>{status}</span>;
    } },
    { key: "createdAt", label: "Created Date", cellClassName: "text-[#64748B]", render: value => value || "Today" },
    // Keep the original record and existing CRUD callbacks.
    { key: "actions", label: "Actions", align: "right", render: (_, item) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghostBrand" size="iconSm" onClick={() => onEdit(item)} aria-label={"Edit " + item.name}><Edit2 size={15} /></Button>
        <Button variant="ghostDanger" size="iconSm" onClick={() => onDelete(item)} aria-label={"Delete " + item.name}><Trash2 size={15} /></Button>
        <Button variant="ghost" size="iconSm" aria-label={"More actions for " + item.name}><MoreHorizontal size={15} /></Button>
      </div>
    ) },
  ];

  return (
    <div className="rounded-lg border border-[#D7DFEA] bg-white shadow-sm">
      {/* Search remains controlled by the existing Category hook. */}
      <div className="flex flex-col gap-3 border-b border-[#E5EAF1] p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AA]"
            />
            <Input
              placeholder="Search category..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>

         
        </div>

        {/* <Button
          variant="secondary"
          size="sm"
          className="h-9 !font-medium"
        >
          <Filter size={15} />
          More Filters
        </Button> */}
      </div>

      {/* Table handles stable row IDs, horizontal scrolling, loading and empty states. */}
      <Table
        columns={columns}
        data={categories}
        rowKey="id"
        label="Categories"
        loading={loading}
        loadingMessage="Loading categories..."
        emptyMessage="No categories found."
        minWidth={820}
        className="!rounded-none !border-0"
      />

      {/* Pagination forwards page changes to the existing API logic. */}
      <TablePagination
        firstItem={firstItem}
        lastItem={lastItem}
        totalItems={totalItems}
        label="categories"
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
