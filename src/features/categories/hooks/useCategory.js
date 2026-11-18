import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import categoryService from "../services/categoryService";

export default function useCategory(id, enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["categories", user?.id, "detail", id],
    queryFn: async ({ signal }) => {
      const response = await categoryService.getById(id, signal);
      if (!response.data || typeof response.data.name !== "string") {
        throw new Error("Unexpected category details response.");
      }
      return response.data;
    },
    // Fetch details only while the edit modal is open.
    enabled: enabled && id != null,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (count, error) => count < 1 && (!error.response || error.response.status >= 500),
  });
}
