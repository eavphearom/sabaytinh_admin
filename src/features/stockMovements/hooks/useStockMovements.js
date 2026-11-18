import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import stockMovementService from "../services/stockMovementService";

// Keep retries limited to temporary server/network failures.
const retry = (count, error) =>
  count < 1 && (!error.response || error.response.status >= 500);

// Own search, filters and server pagination for this read-only feature.
export default function useStockMovements() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const query = useQuery({
    queryKey: [
      "stock-movements",
      user?.id,
      { search: search.trim(), type, page, perPage },
    ],
    queryFn: async ({ signal }) => {
      const response = await stockMovementService.getAll(
        {
          pageNo: page,
          perPage,
          ...(search.trim() && { search: search.trim() }),
          // The API parameter is plural: types, not type.
          ...(type !== "" && { type: type }),
        },
        signal,
      );
      if (!Array.isArray(response.data))
        throw new Error("Unexpected stock movement list response.");
      return {
        rows: response.data,
        totalItems: Number(response.pagination?.total ?? response.data.length),
        totalPages: Number(response.pagination?.total_page ?? 1),
        page,
        perPage,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry,
  });
  const filters = useQuery({
    queryKey: ["stock-movement-filter-options", user?.id],
    queryFn: async ({ signal }) => {
      const response = await stockMovementService.getFilters(signal);
      const types = response.data?.types ?? response.data;
      if (!Array.isArray(types))
        throw new Error(
          "Unexpected stock movement filters: expected a types array.",
        );
      return types.map((item) => {
        const value =
          typeof item === "object" && item !== null
            ? (item.id ?? item.value)
            : item;
        const label =
          typeof item === "object" && item !== null
            ? (item.name ?? item.label)
            : item;
        if (value == null || label == null)
          throw new Error("Unexpected stock movement type option.");
        return { value: String(value), label: String(label) };
      });
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry,
  });
  const lastPage = Math.max(1, query.data?.totalPages || 1);
  if (query.isSuccess && !query.isPlaceholderData && page > lastPage)
    setPage(lastPage);
  const error = query.error || filters.error;

  // Reset pagination whenever the search or selected type changes.
  return {
    rows: query.data?.rows ?? [],
    search,
    type,
    onSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    onTypeChange: (value) => {
      setType(value);
      setPage(1);
    },
    typeOptions: [{ value: "", label: "All Types" }, ...(filters.data ?? [])],
    page: query.data?.page ?? page,
    perPage,
    totalItems: query.data?.totalItems ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    startIndex:
      ((query.data?.page ?? page) - 1) * (query.data?.perPage ?? perPage),
    onPageChange: (value) => {
      if (!query.isPlaceholderData) setPage(value);
    },
    onPerPageChange: (value) => {
      setPerPage(Number(value));
      setPage(1);
    },
    loading: query.isPending,
    error: error?.response?.data?.message || error?.message || "",
    onRetry: () => {
      query.refetch();
      filters.refetch();
    },
  };
}
