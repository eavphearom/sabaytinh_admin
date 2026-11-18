import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";

import SizeForm from "../features/sizes/components/SizeForm";
import SizeList from "../features/sizes/components/SizeList";
import useSizes from "../features/sizes/hooks/useSizes";
import sizeService from "../features/sizes/services/sizeService";

export default function SizePage() {
  const data = useSizes();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const actionPending = useRef(false);

  const handleEdit = async (size) => {
    try {
      setSelectedSize(null);

      const response = await sizeService.getById(size.id);

      setSelectedSize(response.data);
      setIsEditOpen(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load size details.",
      );
    }
  };

  const handleDelete = (size) => {
    setSelectedSize(size);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSize || actionPending.current) return;

    actionPending.current = true;

    try {
      const response = await data.deleteSize(selectedSize.id);

      setIsDeleteOpen(false);
      setSelectedSize(null);

      toast.success(response?.message || "Size deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete size.");
    } finally {
      actionPending.current = false;
    }
  };

  const handleCreate = async (values) => {
    if (actionPending.current) return;

    actionPending.current = true;

    try {
      const response = await data.create(values);

      setIsCreateOpen(false);

      toast.success(response?.message || "Size created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create size.");
    } finally {
      actionPending.current = false;
    }
  };

  const handleUpdate = async (values) => {
    if (!selectedSize || actionPending.current) return;

    actionPending.current = true;

    try {
      const response = await data.update(selectedSize.id, values);

      setIsEditOpen(false);
      setSelectedSize(null);

      toast.success(response?.message || "Size updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update size.");
    } finally {
      actionPending.current = false;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
            Sizes
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Manage size options used in product selects
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Size
        </Button>
      </div>

      <div className="space-y-3">
        {data.error && <p className="text-sm text-red-500">{data.error}</p>}

        <SizeList
          {...data}
          onSearch={data.handleSearch}
          onPageChange={data.setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Create */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          if (!actionPending.current) {
            setIsCreateOpen(false);
          }
        }}
        title="Create Size"
      >
        <SizeForm onSubmit={handleCreate} pending={data.creating} />
      </Modal>

      {/* Edit */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          if (!actionPending.current) {
            setIsEditOpen(false);
          }
        }}
        title="Edit Size"
      >
        <SizeForm
          size={selectedSize}
          onSubmit={handleUpdate}
          pending={data.updating}
        />
      </Modal>

      {/* Delete */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!actionPending.current) {
            setIsDeleteOpen(false);
          }
        }}
        onConfirm={handleConfirmDelete}
        loading={data.deleting}
        title="Delete Size"
        message={`Are you sure you want to delete "${selectedSize?.value}"?`}
      />
    </div>
  );
}
