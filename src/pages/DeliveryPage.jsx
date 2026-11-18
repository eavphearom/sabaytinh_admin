import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import DeliveryForm from "../features/deliveries/components/DeliveryForm";
import DeliveryList from "../features/deliveries/components/DeliveryList";
import useDeliveries from "../features/deliveries/hooks/useDeliveries";
import deliveryService from "../features/deliveries/services/deliveryService";

// The page coordinates modals; the hook owns list fetching and CRUD.
export default function DeliveryPage() {
  const data = useDeliveries();
  const [editor, setEditor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const pending = useRef(false);
  const detailRequest = useRef(null);
  useEffect(() => () => detailRequest.current?.abort(), []);

  // Fetch full details before using the same form for editing.
  const handleEdit = async (delivery) => {
    detailRequest.current?.abort();
    const controller = new AbortController();
    detailRequest.current = controller;
    setLoadingDetails(true);
    try {
      const response = await deliveryService.getById(delivery.id, controller.signal);
      if (!controller.signal.aborted) {
        if (!response.data?.id) throw new Error("Unexpected delivery details response.");
        setEditor({ delivery: response.data });
      }
    } catch (error) {
      if (!controller.signal.aborted) toast.error(error.response?.data?.message || error.message);
    } finally {
      if (!controller.signal.aborted) setLoadingDetails(false);
    }
  };
  // Keep failed submissions open so the user can correct and retry.
  const handleSave = async (values) => {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    try {
      const response = editor.delivery
        ? await data.update(editor.delivery.id, values) : await data.create(values);
      setEditor(null);
      toast.success(response?.message || "Delivery saved successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to save delivery.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };
  // Guard double clicks and close the confirmation only after successful deletion.
  const handleDelete = async () => {
    if (!deleteTarget || pending.current) return;
    pending.current = true;
    setDeleting(true);
    try {
      const response = await data.remove(deleteTarget.id);
      setDeleteTarget(null);
      toast.success(response?.message || "Delivery deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to delete delivery.");
    } finally {
      pending.current = false;
      setDeleting(false);
    }
  };
  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-semibold text-[#03152B]">Delivery Methods</h1>
          <p className="mt-1 text-sm text-[#64748B]">Manage delivery fees and estimated delivery times</p>
        </div>
        <Button disabled={loadingDetails} onClick={() => setEditor({ delivery: null })} className="gap-2">
          <Plus size={16} />Add Delivery
        </Button>
      </div>
      {data.error && <div role="alert" className="flex items-center gap-3 text-sm text-red-500">
        <p>{data.error}</p><Button variant="secondary" size="sm" onClick={data.refresh}>Retry</Button>
      </div>}
      <DeliveryList {...data} onEdit={handleEdit} onDelete={setDeleteTarget}
        busy={loadingDetails || saving || deleting} />
      <Modal isOpen={Boolean(editor)} onClose={() => { if (!pending.current) setEditor(null); }}
        title={editor?.delivery ? "Edit Delivery" : "Create Delivery"} size="lg">
        {editor && <DeliveryForm key={editor.delivery?.id ?? "create"} delivery={editor.delivery}
          onSubmit={handleSave} onCancel={() => setEditor(null)} />}
      </Modal>
      <ConfirmModal isOpen={Boolean(deleteTarget)} onClose={() => { if (!pending.current) setDeleteTarget(null); }}
        onConfirm={handleDelete} loading={deleting} title="Delete Delivery"
        message={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"?`} />
    </div>
  );
}
