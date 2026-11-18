import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProductForm from "../features/products/components/ProductForm";
import productService from "../features/products/services/productService";
import useProductCreateOptions from "../features/products/hooks/useProductCreateOptions";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const options = useProductCreateOptions();
  const create = useMutation({
    mutationFn: productService.create,
    onSuccess: async (response) => {
      // Invalidate the list before returning so the newly created product can appear.
      await queryClient.invalidateQueries({ queryKey: ["products", user?.id] });
      navigate("/products", {
        state: { notice: response.message || "Product created successfully.", skipPageLoading: true },
      });
    },
  });
  if (options.isPending)
    return (
      <p role="status" className="text-sm text-[#64748B]">
        Loading product options...
      </p>
    );
  if (options.isError)
    return (
      <div role="alert" className="space-y-3 text-sm text-red-600">
        <p>{options.error.response?.data?.message || options.error.message}</p>
        <button
          type="button"
          onClick={() => options.refetch()}
          className="cursor-pointer underline"
        >
          Retry
        </button>
      </div>
    );
  return (
    <ProductForm
      lookupOptions={options.data}
      onSubmit={create.mutateAsync}
      onCancel={() => navigate("/products")}
    />
  );
}
