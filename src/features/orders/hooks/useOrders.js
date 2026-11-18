import { useEffect, useState } from "react";
import orderService from "../services/orderService";

// Preserve backend values instead of generating enums from display labels.
export const toOrderOptions = (items) => {
  if (!Array.isArray(items)) throw new Error("Expected order_statuses and payment_statuses option arrays.");
  return items.map((item) => {
    const label = item.label ?? item.name;
    if (item.value == null || label == null) throw new Error("Invalid order status option.");
    return { value: String(item.value), label: String(label) };
  });
};

// Normalize status casing for the existing badges and action permissions.
const labelStatus = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "-";
export const mapOrder = (order) => ({
  ...order,
  orderNo: order.order_code, customer: order.customer_name ?? "-",
  date: order.created_at, items: order.total_items, total: order.total_amount,
  paymentMethod: order.payment_method,
  paymentStatus: labelStatus(order.payment_status), status: labelStatus(order.order_status),
});

// Manual fetching and mutations follow Banner's useEffect/useState pattern.
export default function useOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [result, setResult] = useState({ rows: [], total: 0, pages: 0, page: 1, perPage: 10 });
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterOptions, setFilterOptions] = useState({ orders: [], payments: [] });
  const [filterError, setFilterError] = useState("");
  const [filterRetry, setFilterRetry] = useState(0);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Load settings independently so typing and pagination do not refetch choices.
  useEffect(() => {
    const controller = new AbortController();
    const fetchFilters = async () => {
      setFiltersLoading(true);
      setFilterError("");
      try {
        const response = await orderService.getFilters(controller.signal);
        if (controller.signal.aborted) return;
        // Settings uses plural keys; list request filters stay singular.
        setFilterOptions({
          orders: toOrderOptions(response.data?.order_statuses),
          payments: toOrderOptions(response.data?.payment_statuses),
        });
      } catch (error) {
        if (!controller.signal.aborted)
          setFilterError(error.response?.data?.message || error.message || "Failed to load order options.");
      } finally {
        if (!controller.signal.aborted) setFiltersLoading(false);
      }
    };
    fetchFilters();
    return () => controller.abort();
  }, [filterRetry]);

  // Abort outdated searches and retain current rows during background requests.
  useEffect(() => {
    const controller = new AbortController();
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await orderService.getAll({
          pageNo: page, perPage, search: search.trim(),
          ...(statusFilter && { order_status: statusFilter }),
          ...(paymentFilter && { payment_status: paymentFilter }),
        }, controller.signal);
        if (controller.signal.aborted) return;
        if (!Array.isArray(response.data)) throw new Error("Unexpected orders response.");
        const pages = Math.max(1, Number(response.pagination?.total_page ?? 1));
        if (page > pages) { setPage(pages); return; }
        setResult({ rows: response.data.map(mapOrder), page, perPage, pages,
          total: Number(response.pagination?.total ?? response.data.length) });
      } catch (error) {
        if (!controller.signal.aborted)
          setError(error.response?.data?.message || error.message || "Failed to load orders.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchOrders();
    return () => controller.abort();
  }, [search, statusFilter, paymentFilter, page, perPage, refreshKey]);

  // Refetch after success so stock, payment and order states come from the server.
  const refresh = () => setRefreshKey((value) => value + 1);
  const updateOrder = async (id, values) => {
    const response = await orderService.updateStatus(id, values);
    refresh();
    return response;
  };
  const cancelOrder = async (id) => {
    const response = await orderService.cancel(id);
    refresh();
    return response;
  };
  return {
    orders: result.rows, search, statusFilter, paymentFilter,
    statusOptions: [{ value: "", label: "All Order Statuses" }, ...filterOptions.orders],
    paymentOptions: [{ value: "", label: "All Payment Statuses" }, ...filterOptions.payments],
    changeStatusOptions: filterOptions.orders,
    filtersLoading,
    loading, error: error || filterError,
    refresh: () => { refresh(); setFilterRetry((value) => value + 1); },
    updateOrder, cancelOrder,
    page: result.page, perPage, totalPages: result.pages, totalItems: result.total,
    startIndex: (result.page - 1) * result.perPage,
    onSearch: (value) => { setSearch(value); setPage(1); },
    onStatusFilter: (value) => { setStatusFilter(value); setPage(1); },
    onPaymentFilter: (value) => { setPaymentFilter(value); setPage(1); },
    onPageChange: (value) => { if (!loading) setPage(value); },
    handlePerPageChange: (value) => { setPerPage(Number(value)); setPage(1); },
  };
}
