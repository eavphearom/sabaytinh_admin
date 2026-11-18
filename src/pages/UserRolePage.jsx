
import UserRoleList from "../features/userRoles/components/UserRoleList";
import useUserRoles from "../features/userRoles/hooks/useUserRoles";

export default function UserRolePage() {
  const data = useUserRoles();

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
            Users & Roles
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage admin users and access roles
          </p>
        </div>
      </div>

      {data.isLoading ? (
        <div className="rounded-lg border bg-white p-8 text-center text-[#64748B]">
          Loading users...
        </div>
      ) : data.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-white p-6"
        >
          <p className="font-semibold text-red-600">
            Failed to load users
          </p>

          <p className="mt-1 text-sm text-[#64748B]">
            {data.error?.response?.data?.message ||
              data.error?.message ||
              "Please try again."}
          </p>

          <button
            type="button"
            onClick={() => data.refetch()}
            className="mt-3 rounded-md bg-[#03152B] px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {data.isFetching && (
            <p className="text-sm text-[#64748B]">
              Updating users...
            </p>
          )}

          <UserRoleList
            users={data.users}
            search={data.search}
            onSearch={data.handleSearch}
            roleFilter={data.roleFilter}
            onRoleFilter={data.handleRoleFilter}
            roleOptions={data.roleOptions}
            page={data.page}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            startIndex={data.startIndex}
            perPage={data.perPage}
            onPageChange={data.handlePageChange}
            handlePerPageChange={data.handlePerPageChange}
          />
        </>
      )}
    </div>
  );
}
