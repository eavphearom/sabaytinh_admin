
import CustomerList from "../features/customers/components/CustomerList";
import useCustomers from "../features/customers/hooks/useCustomers";

export default function CustomerPage() {
  const {
    customers,
    page,
    totalPages,
    totalItems,
    startIndex,
    perPage,
    handlePageChange,
    handlePerPageChange,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCustomers();

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
            Customers
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage and view registered customers
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white p-8 text-center text-[#64748B]">
          Loading customers...
        </div>
      ) : isError ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-white p-6">
          <p className="font-semibold text-red-600">
            Failed to load customers
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            {error?.response?.data?.message ||
              error?.message ||
              "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-[#03152B] px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {isFetching && (
            <p className="text-sm text-[#64748B]">
              Updating customers...
            </p>
          )}

          <CustomerList
            customers={customers}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            perPage={perPage}
            onPageChange={handlePageChange}
            handlePerPageChange={handlePerPageChange}
          />
        </>
      )}
    </div>
  );
}
