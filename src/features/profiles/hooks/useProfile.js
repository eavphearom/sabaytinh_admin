
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "../../auth/hooks/useAuth";
import profileService from "../services/profileService";

export default function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // GET profile
  const profileQuery = useQuery({
    queryKey: ["admin", "profile", user?.id],
    queryFn: () => profileService.getProfile(),
    enabled: Boolean(user?.id),
    staleTime: 30 * 1000,
    retry: 1,
  });

  // UPDATE profile
  const updateMutation = useMutation({
    mutationFn: (formData) =>
      profileService.updateProfile(formData),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "profile", user?.id],
      });
    },
  });

  return {
    profile: profileQuery.data?.data ?? null,

    isLoading: profileQuery.isPending,
    isFetching: profileQuery.isFetching,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,

    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
