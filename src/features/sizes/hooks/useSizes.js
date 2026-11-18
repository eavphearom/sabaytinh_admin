import { useEffect, useState } from "react";
import sizeService from "../services/sizeService";

export default function useSizes() {
  const [sizes, setSizes] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSizes = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          pageNo: page,
          perPage,
          search: search.trim(),
        };

        const response = await sizeService.getAll(params, controller.signal);

        if (controller.signal.aborted) return;

        const lastPage = Math.max(1, response.pagination?.total_page ?? 1);

        if (page > lastPage) {
          setPage(lastPage);
          return;
        }

        const items = (response.data ?? []).map((size) => ({
          ...size,

          status:
            size.is_active == null
              ? size.status || "-"
              : size.is_active
                ? "Active"
                : "Inactive",

          createdAt: size.created_at || size.createdAt || "-",
        }));
        setSizes(items);
        setPagination(response.pagination);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(error.response?.data?.message || "Failed to load sizes.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchSizes();

    return () => controller.abort();
  }, [page, perPage, search, refreshKey]);


  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handlePerPageChange = (value) => {
    setPerPage(Number(value));
    setPage(1);
  };

  const create = async (values) => {
    setCreating(true);
    try {
      const response = await sizeService.create(values);

      setPage(1);
      setRefreshKey((prev) => prev + 1);

      return response;
    } finally {
      setCreating(false);
    }
  };

  const update = async (id, values) => {
    setUpdating(true);

    try {
      const response = await sizeService.update(id, values);

      setRefreshKey((prev) => prev + 1);

      return response;
    } finally {
      setUpdating(false);
    }
  };

  const deleteSize = async (id) => {
    setDeleting(true);

    try {
      const response = await sizeService.deleteSize(id);

      setSizes((current) => current.filter((size) => size.id !== id));

      if (sizes.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      }

      setRefreshKey((prev) => prev + 1);

      return response;
    } finally {
      setDeleting(false);
    }
  };

  return {
    sizes,
    loading,
    error,

    search,
    handleSearch,

    page,
    setPage,
    perPage,
    totalPages: pagination?.total_page ?? 0,
    totalItems: pagination?.total ?? 0,
    startIndex: (page - 1) * perPage,
    handlePerPageChange,

    create,
    creating,

    update,
    updating,

    deleteSize,
    deleting,
  };
}
