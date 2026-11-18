import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";
import ColorForm from "../features/colors/components/ColorForm";
import ColorList from "../features/colors/components/ColorList";
import useColors from "../features/colors/hooks/useColors";
import useColor from "../features/colors/hooks/useColor";

export default function ColorPage() {
  const {
    colors,
    search,
    handleSearch,
    page,
    setPage,
    totalPages,
    totalItems,
    startIndex,
    perPage,
    handlePerPageChange,
    addColor,
    updateColor,
    deleteColor,
    creating,
    updating,
    deleting,
    loading,
    error,
    retry,
  } = useColors();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const actionPending = useRef(false);
  const colorDetails = useColor(selectedColor?.id, isEditOpen);

  const handleEdit = (color) => {
    setSelectedColor(color);
    setIsEditOpen(true);
  };

  const handleDelete = (color) => {
    setSelectedColor(color);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedColor || actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await deleteColor(selectedColor.id);
      setIsDeleteOpen(false);
      setSelectedColor(null);
      toast.success(response?.message || "Color deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete color.");
    } finally {
      actionPending.current = false;
    }
  };

  const handleCreate = async (data) => {
    if (actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await addColor(data);
      setIsCreateOpen(false);
      toast.success(response?.message || "Color created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create color.");
    } finally {
      actionPending.current = false;
    }
  };

  const handleUpdate = async (data) => {
    if (!selectedColor || actionPending.current) return;
    actionPending.current = true;
    try {
      const response = await updateColor(selectedColor.id, data);
      setIsEditOpen(false);
      setSelectedColor(null);
      toast.success(response?.message || "Color updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update color.");
    } finally {
      actionPending.current = false;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
            Colors
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage color names, color codes, and descriptions
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Color
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 text-sm text-red-600">
          <p>{error}</p>
          <button type="button" onClick={() => retry()} className="cursor-pointer underline">Retry</button>
        </div>
      )}
      <ColorList
        loading={loading}
        colors={colors}
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
        title="Create Color"
      >
        <ColorForm onSubmit={handleCreate} pending={creating} />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => { if (!actionPending.current) setIsEditOpen(false); }}
        title="Edit Color"
      >
        {isEditOpen && (
          <ColorForm
            key={selectedColor.id}
            color={colorDetails.data}
            onSubmit={handleUpdate}
            pending={updating}
            loading={colorDetails.isPending || (colorDetails.isFetching && !updating)}
            error={colorDetails.isError ? colorDetails.error : null}
            onRetry={colorDetails.refetch}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { if (!actionPending.current) setIsDeleteOpen(false); }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Color"
        message={`Are you sure you want to delete "${selectedColor?.name}"?`}
      />
    </div>
  );
}
