import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import ProductForm from "../features/products/components/ProductForm";
import useProduct from "../features/products/hooks/useProduct";
import useProductCreateOptions from "../features/products/hooks/useProductCreateOptions";

// Remount form state when the URL points to a different product.
export default function ProductEditPage() {
  const { id } = useParams();
  return <ProductEditor key={id} id={id} />;
}

// Wait for detail data and real dropdown IDs before mounting the shared form.
function ProductEditor({ id }) {
  const navigate = useNavigate();
  const detail = useProduct(id);
  const options = useProductCreateOptions();
  const error = detail.error || options.error;

  // Redirect only after the update succeeds, without a full-page loading flash.
  async function update(values) {
    const response = await detail.updateProduct(values);
    navigate("/products", {
      state: { notice: response.message || "Product updated successfully.", skipPageLoading: true },
    });
  }

  if (error) return (
    <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-white p-6 text-sm">
      <p>{error.response?.data?.message || error.message}</p>
      <Button variant="secondary" onClick={() => { detail.refetch(); options.refetch(); }}>Retry</Button>
      <Link to="/products" className="ml-3 text-[#F97316]">Back to Products</Link>
    </div>
  );
  if (detail.isPending || options.isPending) return <p role="status" className="p-6 text-sm text-[#64748B]">Loading product...</p>;
  return <ProductForm product={detail.data} lookupOptions={options.data} onSubmit={update} onCancel={() => navigate("/products")} />;
}
