import Table from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import { Edit2, Eye, Image, Search, Trash2 } from "lucide-react";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TablePagination from "../../../components/ui/TablePagination";

export default function ProductList({
  products,
  search,
  onSearch,
  categoryFilter,
  onCategoryFilter,
  categoryOptions,
  brandFilter,
  onBrandFilter,
  brandOptions,
  page,
  totalPages,
  totalItems,
  startIndex,
  perPage,
  handlePerPageChange,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  loading = false,
}) {
  const firstItem = totalItems === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + products.length, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  // Custom cells preserve feature UI; Table owns rows, keys and empty states.
  const columns = [
    {
      key: "product", label: "Product",
      render: (_, product) => (<><div className="flex items-center gap-3">
                    <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-lg bg-[#FFF7ED] text-[#F97316]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="h-18 w-18 rounded-lg object-contain"
                        />
                      ) : (
                        <Image size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[#03152B]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Created {product.createdAt}
                      </p>
                    </div>
                  </div></>),
    },
    {
      key: "category", label: "Category",
      cellClassName: "text-[#64748B]",
      render: (_, product) => (<>{product.category}</>),
    },
    {
      key: "brand", label: "Brand",
      cellClassName: "text-[#64748B]",
      render: (_, product) => (<>{product.brand}</>),
    },
    {
      key: "variants", label: "Variants",
      cellClassName: "text-[#03152B]",
      render: (_, product) => (<>{product.variants}</>),
    },
    {
      key: "price_range", label: "Price Range",
      cellClassName: "font-semibold text-[#03152B]",
      render: (_, product) => (<>{product.priceRange}</>),
    },
    {
      key: "stock", label: "Stock",
      cellClassName: "text-[#03152B]",
      render: (_, product) => (<>{product.stock}</>),
    },
    {
      key: "status", label: "Status",
      render: (_, product) => (<><StatusBadge status={product.status} /></>),
    },
    {
      key: "actions", label: "Actions",
      align: "right",
      render: (_, product) => (<><Actions
                    item={product}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  /></>),
    },
  ];

  return (
    <div className="rounded-lg border border-[#D7DFEA] bg-white shadow-sm">
      <div className="border-b border-[#E5EAF1] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AA]"
            />
            <Input
              placeholder="Search product..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={categoryFilter}
              onChange={(e) => onCategoryFilter(e.target.value)}
              options={categoryOptions}
              placeholder=""
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              value={brandFilter}
              onChange={(e) => onBrandFilter(e.target.value)}
              options={brandOptions}
              placeholder=""
            />
          </div>
        </div>
      </div>

      {/* Search and pagination stay in the feature; Table only renders the current page. */}
      <Table
        columns={columns}
        data={products}
        rowKey="id"
        label="Products"
        loading={loading}
        loadingMessage="Loading products..."
        emptyMessage="No products found."
        minWidth={900}
        className="!rounded-none !border-0"
      />

      <TablePagination
        firstItem={firstItem}
        lastItem={lastItem}
        totalItems={totalItems}
        label="products"
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
  const statusStyle =
    status === "Active"
      ? "bg-[#DCFCE7] text-[#15803D]"
      : status === "Draft"
        ? "bg-amber-100 text-amber-700"
        : "bg-[#F1F5F9] text-[#64748B]";

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusStyle}`}
    >
      {status}
    </span>
  );
}

function Actions({ item, onView, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        onClick={() => onView(item)}
        variant="ghostBrand" size="iconSm"
        aria-label={`View ${item.sku}`}
      >
        <Eye size={15} />
      </Button>
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
