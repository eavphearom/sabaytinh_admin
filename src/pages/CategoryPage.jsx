import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";
import CategoryForm from "../features/categories/components/CategoryForm";
import CategoryList from "../features/categories/components/CategoryList";
import useCategories from "../features/categories/hooks/useCategories";
import useCategory from "../features/categories/hooks/useCategory";

export default function CategoryPage() {
  const {
    categories,
    search,
    handleSearch,
    page,
    setPage,
    totalPages,
    totalItems,
    startIndex,
    perPage,
    handlePerPageChange,
    addCategory,
    updateCategory,
    deleteCategory,
    creating,
    updating,
    deleting,
    loading,
    error,
    retry,
  } = useCategories();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const actionPending = useRef(false);
  const categoryDetails = useCategory(selectedCategory?.id, isEditOpen);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory || actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await deleteCategory(selectedCategory.id);
      setIsDeleteOpen(false);
      setSelectedCategory(null);
      toast.success(response?.message || "Category deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category.");
    } finally {
      actionPending.current = false;
    }
  };

  const handleCreate = async (data) => {
    if (actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await addCategory(data);
      setIsCreateOpen(false);
      toast.success(response?.message || "Category created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category.");
    } finally {
      actionPending.current = false;
    }
  };

  const handleUpdate = async (data) => {
    if (!selectedCategory || actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await updateCategory(selectedCategory.id, data);
      setIsEditOpen(false);
      setSelectedCategory(null);
      toast.success(response?.message || "Category updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category.");
    } finally {
      actionPending.current = false;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
            Categories
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage your product categories
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-red-600">
          <p>{error}</p>
          <button type="button" onClick={() => retry()} className="cursor-pointer underline">Retry</button>
        </div>
      )}
      <CategoryList
        loading={loading}
        categories={categories}
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
        title="Create Category"
        size="xl"
      >
        <CategoryForm onSubmit={handleCreate} pending={creating} />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => { if (!actionPending.current) setIsEditOpen(false); }}
        title="Edit Category"
        size="xl"
      >
        {isEditOpen && (
          <CategoryForm
            key={selectedCategory.id}
            category={categoryDetails.data}
            onSubmit={handleUpdate}
            pending={updating}
            loading={categoryDetails.isPending || (categoryDetails.isFetching && !updating)}
            error={categoryDetails.isError ? categoryDetails.error : null}
            onRetry={categoryDetails.refetch}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { if (!actionPending.current) setIsDeleteOpen(false); }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"?`}
      />
    </div>
  );
}
