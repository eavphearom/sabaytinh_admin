import Button from "../../../components/ui/Button";
import { Eye, RefreshCw, Search, XCircle } from "lucide-react";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import TablePagination from "../../../components/ui/TablePagination";
import Table from "../../../components/ui/Table";

export default function OrderList({
  orders,
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  statusOptions,
  paymentFilter,
  onPaymentFilter,
  paymentOptions,
  loading = false,
  page,
  totalPages,
  totalItems,
  startIndex,
  perPage,
  handlePerPageChange,
  onPageChange,
  onView,
  onUpdateStatus,
  onCancel,
}) {
  const firstItem = totalItems === 0 ? 0 : startIndex + 1;
  const lastItem = Math.min(startIndex + orders.length, totalItems);
  // Limit page buttons to keep the toolbar usable on small screens.
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index);

  // Custom cells preserve feature UI; Table owns rows, keys and empty states.
  const columns = [
    {
      key: "order_code", label: "Order Code",
      cellClassName: "font-semibold text-[#03152B]",
      render: (_, order) => (<>#{order.orderNo}</>),
    },
    {
      key: "customer", label: "Customer",
      cellClassName: "text-[#64748B]",
      render: (_, order) => (<>{order.customer}</>),
    },
    {
      key: "order_date", label: "Order Date",
      cellClassName: "text-[#64748B]",
      render: (_, order) => (<>{order.date}</>),
    },
    {
      key: "items_count", label: "Items Count",
      cellClassName: "text-[#03152B]",
      render: (_, order) => (<>{order.items}</>),
    },
    {
      key: "total", label: "Total",
      cellClassName: "font-semibold text-[#03152B]",
      render: (_, order) => (<>{order.currency} {Number(order.total).toFixed(2)}</>),
    },
    {
      key: "payment_method", label: "Payment Method",
      cellClassName: "text-[#64748B]",
      render: (_, order) => (<>{order.paymentMethod}</>),
    },
    {
      key: "payment_status", label: "Payment Status",
      render: (_, order) => (<><PaymentBadge status={order.paymentStatus} /></>),
    },
    {
      key: "order_status", label: "Order Status",
      render: (_, order) => (<><OrderBadge status={order.status} /></>),
    },
    {
      key: "actions", label: "Actions",
      align: "right",
      render: (_, order) => (<><Actions
                    item={order}
                    label={order.orderNo}
                    onView={onView}
                    onUpdateStatus={onUpdateStatus}
                    onCancel={onCancel}
                  /></>),
    },
  ];

  return (
    <div className="rounded-lg border border-[#D7DFEA] bg-white shadow-sm">
      <div className="border-b border-[#E5EAF1] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A98AA]" />
            <Input placeholder="Search order..." value={search} onChange={(e) => onSearch(e.target.value)} className="h-9 pl-9" />
          </div>
          <div className="w-full sm:w-44">
            <Select value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)} options={statusOptions} placeholder="" />
          </div>
          <div className="w-full sm:w-48">
            <Select value={paymentFilter} onChange={(e) => onPaymentFilter(e.target.value)} options={paymentOptions} placeholder="" />
          </div>
        </div>
      </div>

      {/* Search and pagination stay in the feature; Table only renders the current page. */}
      <Table
        columns={columns}
        data={orders}
        rowKey="id"
        label="Orders"
        loading={loading}
        loadingMessage="Loading orders..."
        emptyMessage="No orders found."
        minWidth={860}
        className="!rounded-none !border-0"
      />
      <TablePagination firstItem={firstItem} lastItem={lastItem} totalItems={totalItems} label="orders" page={page} pages={pages} totalPages={totalPages} perPage={perPage} onPageChange={onPageChange} handlePerPageChange={handlePerPageChange} />

    </div>
  );
}

function OrderBadge({ status }) {
  const styles = {
    Pending: "bg-amber-100 text-amber-700",
    Processing: "bg-[#FFF7ED] text-[#F97316]",
    Shipped: "bg-indigo-50 text-indigo-700",
    Delivered: "bg-[#DCFCE7] text-[#15803D]",
    Cancelled: "bg-red-50 text-red-600",
  };
  return <span className={`rounded-md px-2 py-1 text-xs font-semibold ${styles[status]}`}>{status}</span>;
}

function PaymentBadge({ status }) {
  const styles = {
    Paid: "bg-[#DCFCE7] text-[#15803D]",
    Pending: "bg-amber-100 text-amber-700",
    Refunded: "bg-[#F1F5F9] text-[#64748B]",
    Failed: "bg-red-50 text-red-600",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
}

function Actions({ item, label, onView, onUpdateStatus, onCancel }) {
  const canUpdateStatus = !["Delivered", "Cancelled"].includes(item.status);
  const canCancel = ["Pending", "Processing"].includes(item.status);

  return (
    <div className="flex justify-end gap-1">
      <Button type="button" onClick={() => onView(item)} variant="ghostBrand" size="iconSm" aria-label={`View details for ${label}`}><Eye size={15} /></Button>
      {canUpdateStatus && (
        <Button type="button" onClick={() => onUpdateStatus(item)} variant="ghostBrand" size="iconSm" aria-label={`Update status for ${label}`}><RefreshCw size={15} /></Button>
      )}
      {canCancel && (
        <Button type="button" onClick={() => onCancel(item)} variant="ghostDanger" size="iconSm" aria-label={`Cancel ${label}`}><XCircle size={15} /></Button>
      )}
    </div>
  );
}
