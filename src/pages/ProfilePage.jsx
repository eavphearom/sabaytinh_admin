
import ProfileView from "../features/profiles/components/ProfileView";
import useProfile from "../features/profiles/hooks/useProfile";

export default function ProfilePage() {
  const {
    profile,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    updateProfile,
    isUpdating,
  } = useProfile();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-[#D7DFEA] bg-white p-8 text-center text-[#64748B]">
        Loading profile...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-white p-6"
      >
        <p className="font-semibold text-red-600">
          Failed to load profile
        </p>

        <p className="mt-1 text-sm text-[#64748B]">
          {error?.response?.data?.message ||
            error?.message ||
            "Unable to retrieve profile."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-md bg-[#03152B] px-4 py-2 text-sm text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        Profile information is unavailable.
      </div>
    );
  }

  return (
    <div>
      {isFetching && !isUpdating && (
        <p className="mb-3 text-sm text-[#64748B]">
          Updating profile...
        </p>
      )}

      <ProfileView
        profile={profile}
        onSave={updateProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
}
