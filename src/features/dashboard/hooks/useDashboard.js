
import { useQuery } from "@tanstack/react-query";
import dashboardService from "../services/dashboardService";

export default function useDashboard() {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: dashboardService.getDashboard,
    staleTime: 30 * 1000,
    retry: 1,
  });

  return {
    dashboard: data?.data ?? null,
    isLoading: isPending,
    isError,
    error,
    refetch,
  };
}
