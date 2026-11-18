
import Table from "../../../components/ui/Table";
import TablePagination from "../../../components/ui/TablePagination";

export default function CustomerList({
  customers = [],
  page,
  totalPages,
  totalItems,
  startIndex,
  perPage,
  handlePerPageChange,
  onPageChange,
}) {
  const firstItem = totalItems === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(
    startIndex + customers.length,
    totalItems
  );

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const columns = [
    {
      key: "name",
      label: "Customer",
      render: (name, customer) => (
        <>
          <p className="font-semibold text-[#03152B]">
            {name || "-"}
          </p>
          <p className="text-xs text-[#64748B]">
            {customer.email}
          </p>
        </>
      ),
    },
    {
      key: "orders",
      label: "Total Orders",
    },
    {
      key: "totalSpent",
      label: "Total Spent",
      cellClassName: "font-semibold",
      render: (value, customer) =>
        formatMoney(value, customer.currency),
    },
    {
      key: "currency",
      label: "Currency",
    },
    {
      key: "lastOrderAt",
      label: "Last Order",
      cellClassName: "text-[#64748B]",
      render: (value) => value || "No orders yet",
    },
  ];

  return (
    <div className="rounded-lg border border-[#D7DFEA] bg-white shadow-sm">
      <Table
        columns={columns}
        data={customers}
        label="Customers"
        minWidth={700}
        emptyMessage="No customers found."
        className="!rounded-none !border-0"
      />

      <TablePagination
        firstItem={firstItem}
        lastItem={lastItem}
        totalItems={totalItems}
        label="customers"
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

function formatMoney(value, currency) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
