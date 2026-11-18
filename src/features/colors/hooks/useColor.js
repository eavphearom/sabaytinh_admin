import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import colorService from "../services/colorService";

export default function useColor(id, enabled = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["colors", user?.id, "detail", id],
    queryFn: async ({ signal }) => {
      const response = await colorService.getById(id, signal);
      const color = response.data;
      if (!color || typeof color.name !== "string" || typeof color.hex_code !== "string") {
        throw new Error("Unexpected color details response.");
      }
      return { ...color, colorCode: color.hex_code };
    },
    enabled: enabled && id != null,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (count, error) => count < 1 && (!error.response || error.response.status >= 500),
  });
}
