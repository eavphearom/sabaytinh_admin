import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import productService from "../services/productService";

const money = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value),
  );

export default function useProducts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // Refresh all product lists and details only after deletion succeeds.
  const deleteMutation = useMutation({
    mutationFn: productService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products", user?.id] }),
  });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const query = useQuery({
    // Each filter/page has its own cache entry.
    queryKey: [
      "products",
      user?.id,
      { search: search.trim(), categoryFilter, brandFilter, page, perPage },
    ],
    queryFn: async ({ signal }) => {
      const response = await productService.getAll(
        {
          pageNo: page,
          perPage,
          ...(search.trim() && { search: search.trim() }),
          ...(categoryFilter && { category_id: categoryFilter }),
          ...(brandFilter && { brand_id: brandFilter }),
        },
        signal,
      );
      if (!Array.isArray(response.data))
        throw new Error("Unexpected product list response.");
      return {
        // Translate API names without changing the existing table design.
        products: response.data.map((product) => ({
          ...product,
          sku: product.code,
          category: product.category_name || "-",
          brand: product.brand_name || "-",
          variants: product.total_variants ?? 0,
          stock: product.total_stock ?? 0,
          priceRange:
            product.min_price == null
              ? "-"
              : product.max_price == null ||
                  Number(product.min_price) === Number(product.max_price)
                ? money(product.min_price)
                : money(product.min_price) + " - " + money(product.max_price),
          status: product.is_active ? "Active" : "Inactive",
          createdAt: product.created_at || "-",
          images: product.image ? [product.image] : [],
        })),
        totalItems: response.pagination?.total ?? response.data.length,
        totalPages: response.pagination?.total_page ?? 1,
        page,
        perPage,
      };
    },
    // Keep the table visible during search/filter requests; cache for 30 seconds.
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (count, error) =>
      count < 1 && (!error.response || error.response.status >= 500),
  });
  const filters = useQuery({
    queryKey: ["product-filter-options", user?.id],
    queryFn: async ({ signal }) => {
      // One settings request supplies both dropdowns, independently of the product page.
      const response = await productService.getFilters(signal);
      const { categories, brands } = response.data || {};
      if (!Array.isArray(categories) || !Array.isArray(brands)) {
        throw new Error(
          "Unexpected product filters response: expected categories and brands arrays.",
        );
      }
      const toOption = (item) => ({ value: String(item.id), label: item.name });
      return {
        categories: categories.map(toOption),
        brands: brands.map(toOption),
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (count, error) =>
      count < 1 && (!error.response || error.response.status >= 500),
  });
  const lastPage = Math.max(1, Number(query.data?.totalPages) || 1);
  if (query.isSuccess && !query.isPlaceholderData && page > lastPage)
    setPage(lastPage);
  const error = query.error || filters.error;

  return {
    products: query.data?.products ?? [],
    search,
    handleSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    categoryFilter,
    handleCategoryFilter: (value) => {
      setCategoryFilter(value);
      setPage(1);
    },
    categoryOptions: [
      { value: "", label: "All Categories" },
      ...(filters.data?.categories || []),
    ],
    brandFilter,
    handleBrandFilter: (value) => {
      setBrandFilter(value);
      setPage(1);
    },
    brandOptions: [
      { value: "", label: "All Brands" },
      ...(filters.data?.brands || []),
    ],
    page: query.data?.page ?? page,
    setPage: (value) => {
      if (!query.isPlaceholderData) setPage(value);
    },
    totalPages: query.data?.totalPages ?? 0,
    totalItems: query.data?.totalItems ?? 0,
    startIndex:
      ((query.data?.page ?? page) - 1) * (query.data?.perPage ?? perPage),
    perPage,
    handlePerPageChange: (value) => {
      setPerPage(Number(value));
      setPage(1);
    },
    deleteProduct: deleteMutation.mutateAsync,
    loading: query.isPending,
    error: error?.response?.data?.message || error?.message || "",
    retry: () => {
      query.refetch();
      filters.refetch();
    },
  };
}
