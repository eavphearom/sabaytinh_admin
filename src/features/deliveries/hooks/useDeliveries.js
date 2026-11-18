import { useEffect, useState } from "react";
import deliveryService, { toDeliveryFormData } from "../services/deliveryService";

// Manual list and CRUD state, following Banner without TanStack Query.
export default function useDeliveries() {
  const [result, setResult] = useState({ rows: [], total: 0, pages: 0, page: 1, perPage: 10 });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cancel old requests so a slow search cannot overwrite newer results.
  useEffect(() => {
    const controller = new AbortController();
    const fetchDeliveries = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await deliveryService.getAll(
          { pageNo: page, perPage, search: search.trim() }, controller.signal,
        );
        if (controller.signal.aborted) return;
        if (!Array.isArray(response.data)) throw new Error("Unexpected delivery list response.");
        const pages = Math.max(1, Number(response.pagination?.total_page ?? 1));
        // Move back if deletion leaves the current page empty.
        if (page > pages) { setPage(pages); return; }
        setResult({ rows: response.data, page, perPage, pages,
          total: Number(response.pagination?.total ?? response.data.length) });
      } catch (error) {
        if (!controller.signal.aborted)
          setError(error.response?.data?.message || error.message || "Failed to load delivery methods.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchDeliveries();
    return () => controller.abort();
  }, [search, page, perPage, refreshKey]);

  // Refresh in the background while retaining current table rows.
  const refresh = () => setRefreshKey((value) => value + 1);
  // Creation returns to the first page.
  const create = async (values) => {
    const response = await deliveryService.create(toDeliveryFormData(values));
    setPage(1);
    refresh();
    return response;
  };
  // Create and update share one multipart builder.
  const update = async (id, values) => {
    const response = await deliveryService.update(id, toDeliveryFormData(values));
    refresh();
    return response;
  };
  // Refresh only after the API confirms deletion.
  const remove = async (id) => {
    const response = await deliveryService.remove(id);
    refresh();
    return response;
  };
  return {
    deliveries: result.rows, loading, error, search, perPage,
    page: result.page, totalItems: result.total, totalPages: result.pages,
    startIndex: (result.page - 1) * result.perPage,
    onSearch: (value) => { setSearch(value); setPage(1); },
    onPageChange: (value) => { if (!loading) setPage(value); },
    handlePerPageChange: (value) => { setPerPage(Number(value)); setPage(1); },
    refresh, create, update, remove,
  };
}
