import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/hooks/useAuth";
import productService from "../services/productService";
import colorService from "../../colors/services/colorService";
import sizeService from "../../sizes/services/sizeService";

// Fetch all pages so valid colors and sizes are not missing from the form.
async function allOptions(service, signal, label) {
  const options = [];
  let pageNo = 1;
  let pages;
  do {
    const response = await service.getAll({ pageNo, perPage: 100 }, signal);
    if (!Array.isArray(response.data))
      throw new Error("Unexpected product options response.");
    options.push(
      ...response.data.map((item) => ({
        value: String(item.id),
        label: String(label(item)),
      })),
    );
    pages = Number(response.pagination?.total_page) || 1;
    pageNo++;
  } while (pageNo <= pages);
  return options;
}

export default function useProductCreateOptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["product-create-options", user?.id],
    queryFn: async ({ signal }) => {
      const response = await productService.getFilters(signal);
      const { categories, brands } = response.data || {};
      if (!Array.isArray(categories) || !Array.isArray(brands))
        throw new Error("Unexpected product filter response.");
      const colors = await allOptions(
        colorService,
        signal,
        (item) => item.name,
      );
      const sizes = await allOptions(sizeService, signal, (item) => item.value);
      const toOption = (item) => ({ value: String(item.id), label: item.name });
      return {
        categories: categories.map(toOption),
        brands: brands.map(toOption),
        colors,
        sizes,
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: (count, error) =>
      count < 1 && (!error.response || error.response.status >= 500),
  });
}
