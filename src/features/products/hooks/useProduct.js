import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import apiClient from "../../../services/apiClient";
import productService from "../services/productService";
import { productEditValues, assertNoRemovedProductRecords } from "../productEditModel";

// Load one product for editing and refresh related caches after saving.
export default function useProduct(id) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["products", user?.id, "detail", id],
    queryFn: async ({ signal }) => {
      const response = await productService.getById(id, signal);
      return productEditValues(response.data, apiClient.defaults.baseURL, window.location.origin);
    },
    enabled: id != null,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (count, error) => count < 1 && (!error.response || error.response.status >= 500),
  });
  const mutation = useMutation({
    // Keep failures in the form; do not navigate or discard the user's edits.
    mutationFn: async (values) => {
      assertNoRemovedProductRecords(query.data, values);
      return productService.update(id, values);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", user?.id] }),
  });
  return { ...query, updateProduct: mutation.mutateAsync };
}
