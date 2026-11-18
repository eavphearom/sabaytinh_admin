
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import customerService from "../services/customerService";

export default function useCustomers() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "customers", page, perPage],
    queryFn: () => customerService.getCustomers({
      page,
      perPage,
    }),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const customers = (data?.data ?? []).map((customer) => ({
    id: customer.id,
    name: customer.username,
    email: customer.email,
    orders: Number(customer.totalOrders ?? 0),
    totalSpent: customer.totalSpent ?? "0.00",
    currency: customer.currency ?? "USD",
    totalSpentByCurrency: customer.totalSpentByCurrency ?? {},
    lastOrderAt: customer.lastOrderAt ?? null,
  }));

  const pagination = data?.pagination ?? {};

  const totalItems = Number(pagination.total ?? 0);
  const totalPages = Number(pagination.total_page ?? 0);
  const currentPage = Number(pagination.page_no ?? page);
  const currentPerPage = Number(pagination.per_page ?? perPage);

  const startIndex = (currentPage - 1) * currentPerPage;

  const handlePerPageChange = (value) => {
    setPerPage(Number(value));
    setPage(1);
  };

  const handlePageChange = (value) => {
    const nextPage = Number(value);

    if (
      Number.isInteger(nextPage) &&
      nextPage >= 1 &&
      (totalPages === 0 || nextPage <= totalPages)
    ) {
      setPage(nextPage);
    }
  };

  return {
    customers,
    page: currentPage,
    perPage: currentPerPage,
    totalPages,
    totalItems,
    startIndex,
    handlePageChange,
    handlePerPageChange,
    isLoading: isPending,
    isFetching,
    isError,
    error,
    refetch,
  };
}
