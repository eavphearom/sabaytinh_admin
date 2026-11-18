
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import userRoleService from "../services/userRoleService";

export default function useUserRoles() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
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
    queryKey: ["admin", "users", page, perPage],
    queryFn: () =>
      userRoleService.getUsers({ page, perPage }),
    staleTime: 30 * 1000,
    retry: 1,
  });

  // Convert Flask response to frontend fields.
  const users = (data?.data ?? []).map((user) => ({
    id: user.id,
    name: user.username ?? "",
    email: user.email ?? "",
    role: user.role ?? "USER",
    status: user.is_active ? "Active" : "Inactive",
  }));

  // These filters currently apply to the fetched page only.
  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase().trim();

    const matchesSearch =
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword);

    const matchesRole =
      roleFilter === "All Roles" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const pagination = data?.pagination ?? {};

  const totalItems = Number(pagination.total ?? 0);
  const totalPages = Number(pagination.total_page ?? 0);
  const currentPage = Number(pagination.page_no ?? page);
  const currentPerPage = Number(pagination.per_page ?? perPage);

  const startIndex = (currentPage - 1) * currentPerPage;

  const roleOptions = [
    { value: "All Roles", label: "All Roles" },
    { value: "ADMIN", label: "Admin" },
    { value: "USER", label: "User" },
  ];

  const handleSearch = (value) => {
    setSearch(value);
  };

  const handleRoleFilter = (value) => {
    setRoleFilter(value);
  };

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
    users: filteredUsers,
    search,
    handleSearch,
    roleFilter,
    handleRoleFilter,
    roleOptions,
    page: currentPage,
    totalPages,
    totalItems,
    startIndex,
    perPage: currentPerPage,
    handlePerPageChange,
    handlePageChange,
    isLoading: isPending,
    isFetching,
    isError,
    error,
    refetch,
  };
}
