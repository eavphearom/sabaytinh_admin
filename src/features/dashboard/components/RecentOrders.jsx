import { useQuery } from "@tanstack/react-query";
import Table from "../../../components/ui/Table";
import Button from "../../../components/ui/Button";
import orderService from "../../orders/services/orderService";

function OrderStatus({ status }) {
  const value = String(status ?? "").toLowerCase();
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-orange-50 text-orange-600",
    shipped: "bg-indigo-50 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-50 text-red-600",
  };
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${styles[value] || "bg-slate-100 text-slate-600"}`}>
      {value ? value.charAt(0).toUpperCase() + value.slice(1) : "-"}
    </span>
  );
}

const columns = [
  { key: "order_code", label: "Order Code", cellClassName: "font-semibold" },
  { key: "customer_name", label: "Customer" },
  { key: "created_at", label: "Order Date" },
  { key: "total_items", label: "Items Count" },
  {
    key: "total_amount", label: "Total", cellClassName: "font-semibold whitespace-nowrap",
    render: (value, order) => value == null || value === "" || !Number.isFinite(Number(value))
      ? "-" : `${order.currency ?? ""} ${Number(value).toFixed(2)}`.trim(),
  },
  { key: "payment_method", label: "Payment Method" },
  { key: "payment_status", label: "Payment Status", cellClassName: "capitalize" },
  { key: "order_status", label: "Order Status", render: (value) => <OrderStatus status={value} /> },
];

export default function RecentOrders() {
  const { data: orders = [], isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "orders", "recent"],
    queryFn: async ({ signal }) => {
      // Omit all query parameters so the backend controls filters and page size.
      const response = await orderService.getAll(undefined, signal);
      if (!Array.isArray(response.data)) throw new Error("Unexpected orders response.");
      return response.data;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white shadow-sm" aria-labelledby="recent-orders-title">
      <div className="border-b border-slate-200 p-5">
        <h2 id="recent-orders-title" className="text-lg font-semibold text-slate-950">Recent Orders</h2>
        <p className="mt-1 text-sm text-slate-500">Latest purchases from customers</p>
      </div>
      {isError && (
        <div role="alert" className="space-y-2 p-5">
          <p className="font-semibold text-red-600">Failed to load recent orders</p>
          <p className="text-sm text-slate-500">{error?.response?.data?.message || error?.message || "Please try again."}</p>
          <Button variant="secondary" onClick={() => refetch()} loading={isFetching}>Retry</Button>
        </div>
      )}
      {(!isError || orders.length > 0) && (
        <Table columns={columns} data={orders} label="Recent Orders" loading={isPending}
          loadingMessage="Loading recent orders..." emptyMessage="No orders found."
          minWidth={860} className="!rounded-none !border-0" />
      )}
    </section>
  );
}
