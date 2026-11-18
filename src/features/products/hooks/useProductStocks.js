import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import productService from "../services/productService";

const statusLabels = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

// Keep the server's totals: available sizes and low-stock rules belong to the API.
function summary(data) {
  return {
    total: data.total_stock ?? 0,
    sizes: data.total_sizes ?? 0,
    available: data.available_sizes ?? 0,
    low: data.low_stock_sizes ?? 0,
    out: data.out_of_stock_sizes ?? 0,
  };
}

export function mapProductStocks(data) {
  if (!data || !Array.isArray(data.variants))
    throw new Error("Unexpected product stock response.");
  return {
    ...data,
    sku: data.code,
    category: data.category_name,
    status: data.is_active ? "Active" : "Inactive",
    summary: summary(data),
    variants: data.variants.map((variant) => ({
      ...variant,
      color: variant.color_name,
      colorCode: variant.color_hex,
      status: variant.is_active ? "Active" : "Inactive",
      summary: summary(variant),
      stocks: (variant.stocks || []).map((stock) => ({
        ...stock,
        stock: stock.qty,
        lowStock: stock.low_stock_alert,
        status:
          statusLabels[stock.stock_status] || stock.stock_status || "Unknown",
      })),
    })),
  };
}

export default function useProductStocks(id) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["products", user?.id, "stocks", id],
    queryFn: async ({ signal }) => {
      const response = await productService.getStocks(id, signal);
      if (response.error)
        throw new Error(response.message || "Could not load product stock.");
      return mapProductStocks(response.data);
    },
    enabled: id != null,
    // Refresh stock whenever the modal opens, with a separate cache for each product.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: (count, error) =>
      count < 1 && (!error.response || error.response.status >= 500),
  });
}
