import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";
import BannerForm from "../features/banners/components/BannerForm";
import BannerList from "../features/banners/components/BannerList";
import useBanners from "../features/banners/hooks/useBanners";
import toast from "react-hot-toast";
// import Loading from "@/components/ui/Loading";
import bannerService from "../features/banners/services/bannerService";
export default function BannerPage() {
  const data = useBanners();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deletePending = useRef(false);

  const handleEdit = async (banner) => {
    try {
      setSelectedBanner(null);
      const response = await bannerService.getById(banner.id);
      setSelectedBanner(response.data);
      setIsEditOpen(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load banner details.",
      );
    }
  };

  const handleDelete = (banner) => {
    setSelectedBanner(banner);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBanner || deletePending.current) return;
    deletePending.current = true;
    try {
      const response = await data.deleteBanner(selectedBanner.id);
      setIsDeleteOpen(false);
      setSelectedBanner(null);
      toast.success(response?.message || "Banner deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete banner. Please try again.");
    } finally {
      deletePending.current = false;
    }
  };

  const handleCreate = async (formData) => {
    try {
      const response = await data.create(formData);
      setIsCreateOpen(false);
      toast.success(response.message || "Banner created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create Banner.");
      console.error("Failed to create Banner:", error);
    }
  };

  const handleUpdate = async (values) => {
    if (!selectedBanner) return;

    try {
      const response = await data.update(selectedBanner.id, values);

      setIsEditOpen(false);
      setSelectedBanner(null);

      toast.success(response.message || "Banner updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update banner.",
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
            Banners
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage store banners, promotional images, and placements
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Banner
        </Button>
      </div>

      <div className="space-y-3">
        {data.error && <p className="text-sm text-red-500">{data.error}</p>}

        <BannerList {...data} onEdit={handleEdit} onDelete={handleDelete} />

        {/* {data.loading && (
          // <p className="text-center text-sm text-gray-500">
          //   Loading banners...
          // </p>
          // <Loading overlay={false} />
        )} */}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Banner"
        size="lg"
      >
        <BannerForm onSubmit={handleCreate} />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Banner"
        size="lg"
      >
        <BannerForm banner={selectedBanner} onSubmit={handleUpdate} />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!deletePending.current) setIsDeleteOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        loading={data.deleting}
        title="Delete Banner"
        message={`Are you sure you want to delete "${selectedBanner?.title}"?`}
      />
    </div>
  );
}
