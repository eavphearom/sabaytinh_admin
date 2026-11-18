import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import categoryService from "../services/categoryService";

export default function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const queryKey = ["categories", user?.id];

  const query = useQuery({
    queryKey: [...queryKey, { search: search.trim(), page, perPage }],
    queryFn: async ({ signal }) => {
      const response = await categoryService.getAll({
        pageNo: page,
        perPage,
        search: search.trim(),
      }, signal);
      if (!Array.isArray(response.data)) throw new Error("Unexpected category list response.");
      return {
        categories: response.data.map(category => ({
          ...category,
          status: category.is_active ? "Active" : "Inactive",
          createdAt: category.created_at || category.createdAt || "-",
        })),
        totalItems: response.pagination?.total ?? response.data.length,
        totalPages: response.pagination?.total_page ?? 1,
        page,
        perPage,
      };
    },
    placeholderData: keepPreviousData,
    // Reuse fresh results for 30 seconds when returning to this page.
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (count, error) => count < 1 && (!error.response || error.response.status >= 500),
  });

  // Refresh cached lists and details after a successful change.
  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const createMutation = useMutation({ mutationFn: categoryService.create, onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: categoryService.update, onSuccess: refresh });
  const deleteMutation = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: refresh,
  });
  const lastPage = Math.max(1, Number(query.data?.totalPages) || 1);
  if (query.isSuccess && !query.isPlaceholderData && page > lastPage) {
    setPage(lastPage);
  }

  return {
    categories: query.data?.categories ?? [],
    search,
    handleSearch: value => { setSearch(value); setPage(1); },
    page: query.data?.page ?? page,
    setPage: value => { if (!query.isPlaceholderData) setPage(value); },
    totalPages: query.data?.totalPages ?? 0,
    totalItems: query.data?.totalItems ?? 0,
    startIndex: ((query.data?.page ?? page) - 1) * (query.data?.perPage ?? perPage),
    perPage,
    handlePerPageChange: value => { setPerPage(Number(value)); setPage(1); },
    addCategory: createMutation.mutateAsync,
    updateCategory: (id, values) => updateMutation.mutateAsync({ id, values }),
    deleteCategory: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    loading: query.isPending,
    fetching: query.isFetching,
    error: query.error?.response?.data?.message || query.error?.message || "",
    retry: query.refetch,
  };
}
