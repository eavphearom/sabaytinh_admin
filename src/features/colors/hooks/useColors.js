import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import colorService from "../services/colorService";

export default function useColors() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const queryKey = ["colors", user?.id];

  const query = useQuery({
    queryKey: [...queryKey, { search: search.trim(), page, perPage }],
    queryFn: async ({ signal }) => {
      const response = await colorService.getAll(
        {
          pageNo: page,
          perPage,
          search: search.trim(),
        },
        signal,
      );
      if (!Array.isArray(response.data))
        throw new Error("Unexpected color list response.");
      return {
        colors: response.data.map((color) => ({
          ...color,
          colorCode: color.hex_code,
          createdAt: color.created_at || color.createdAt || "-",
        })),
        totalItems: response.pagination?.total ?? response.data.length,
        totalPages: response.pagination?.total_page ?? 1,
        page,
        perPage,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (count, error) =>
      count < 1 && (!error.response || error.response.status >= 500),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey });
  const createMutation = useMutation({
    mutationFn: colorService.create,
    onSuccess: refresh,
  });
  const updateMutation = useMutation({
    mutationFn: colorService.update,
    onSuccess: refresh,
  });
  const deleteMutation = useMutation({
    mutationFn: colorService.remove,
    onSuccess: refresh,
  });
  const lastPage = Math.max(1, Number(query.data?.totalPages) || 1);
  if (query.isSuccess && !query.isPlaceholderData && page > lastPage) {
    setPage(lastPage);
  }

  return {
    colors: query.data?.colors ?? [],
    search,
    handleSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    page: query.data?.page ?? page,
    setPage: (value) => {
      if (!query.isPlaceholderData) setPage(value);
    },
    totalPages: query.data?.totalPages ?? 0,
    totalItems: query.data?.totalItems ?? 0,
    startIndex:
      ((query.data?.page ?? page) - 1) * (query.data?.perPage ?? perPage),
    perPage,
    handlePerPageChange: (value) => {
      setPerPage(Number(value));
      setPage(1);
    },
    addColor: createMutation.mutateAsync,
    updateColor: (id, values) => updateMutation.mutateAsync({ id, values }),
    deleteColor: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    loading: query.isPending,
    fetching: query.isFetching,
    error: query.error?.response?.data?.message || query.error?.message || "",
    retry: query.refetch,
  };
}
