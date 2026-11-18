import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";
import BrandForm from "../features/brands/components/BrandForm";
import BrandList from "../features/brands/components/BrandList";
import useBrands from "../features/brands/hooks/useBrands";
import useBrand from "../features/brands/hooks/useBrand";

export default function BrandPage() {
  const {
    brands,
    search,
    handleSearch,
    page,
    setPage,
    totalPages,
    totalItems,
    startIndex,
    perPage,
    handlePerPageChange,
    addBrand,
    updateBrand,
    deleteBrand,
    creating,
    updating,
    deleting,
    loading,
    error,
    retry,
  } = useBrands();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const actionPending = useRef(false);
  const brandDetails = useBrand(selectedBrand?.id, isEditOpen);

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setIsEditOpen(true);
  };

  const handleDelete = (brand) => {
    setSelectedBrand(brand);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBrand || actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await deleteBrand(selectedBrand.id);
      setIsDeleteOpen(false);
      setSelectedBrand(null);
      toast.success(response?.message || "Brand deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete brand.");
    } finally {
      actionPending.current = false;
    }
  };

  const handleCreate = async (data) => {
    if (actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await addBrand(data);
      setIsCreateOpen(false);
      toast.success(response?.message || "Brand created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create brand.");
    } finally {
      actionPending.current = false;
    }
  };

  const handleUpdate = async (data) => {
    if (!selectedBrand || actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await updateBrand(selectedBrand.id, data);
      setIsEditOpen(false);
      setSelectedBrand(null);
      toast.success(response?.message || "Brand updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update brand.");
    } finally {
      actionPending.current = false;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
            Brands
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage product brands and brand logos
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Brand
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-red-600">
          <p>{error}</p>
          <button type="button" onClick={() => retry()} className="cursor-pointer underline">Retry</button>
        </div>
      )}
      <BrandList
        loading={loading}
        brands={brands}
        search={search}
        onSearch={handleSearch}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        perPage={perPage}
        handlePerPageChange={handlePerPageChange}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isCreateOpen}
        onClose={() => { if (!actionPending.current) setIsCreateOpen(false); }}
        title="Create Brand"
      >
        <BrandForm onSubmit={handleCreate} pending={creating} />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => { if (!actionPending.current) setIsEditOpen(false); }}
        title="Edit Brand"
      >
        {isEditOpen && (
          <BrandForm
            key={selectedBrand.id}
            brand={brandDetails.data}
            onSubmit={handleUpdate}
            pending={updating}
            loading={brandDetails.isPending || (brandDetails.isFetching && !updating)}
            error={brandDetails.isError ? brandDetails.error : null}
            onRetry={brandDetails.refetch}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { if (!actionPending.current) setIsDeleteOpen(false); }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Brand"
        message={`Are you sure you want to delete "${selectedBrand?.name}"?`}
      />
    </div>
  );
}
