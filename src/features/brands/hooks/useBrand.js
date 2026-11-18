import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import brandService from "../services/brandService";

export default function useBrand(id, enabled = true) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["brands", user?.id, "detail", id],
    queryFn: async ({ signal }) => {
      const response = await brandService.getById(id, signal);
      if (!response.data || typeof response.data.name !== "string") {
        throw new Error("Unexpected brand details response.");
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
