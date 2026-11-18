import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import Modal from "../components/ui/Modal";
import OrderSummary from "../features/orders/components/OrderSummary";
import OrderList from "../features/orders/components/OrderList";
import OrderStatusForm from "../features/orders/components/OrderStatusForm";
import useOrders from "../features/orders/hooks/useOrders";

export default function OrderPage() {
  const data = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setIsStatusOpen(true);
  };

  const handleCancel = (order) => {
    setSelectedOrder(order);
    setIsCancelOpen(true);
  };

  // Await the server before closing; failures keep the entered values available.
  const handleSubmitStatus = async (formData) => {
    if (!selectedOrder || pending.current) return;
    pending.current = true;
    setSaving(true);
    try {
      const response = await data.updateOrder(selectedOrder.id, formData);
      setIsStatusOpen(false);
      setSelectedOrder(null);
      toast.success(response?.message || "Order status updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to update order.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  // Prevent duplicate cancellation and do not invent a refunded payment state.
  const handleConfirmCancel = async () => {
    if (!selectedOrder || pending.current) return;
    pending.current = true;
    setSaving(true);
    try {
      const response = await data.cancelOrder(selectedOrder.id);
      setIsCancelOpen(false);
      setSelectedOrder(null);
      toast.success(response?.message || "Order cancelled.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to cancel order.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Header title="Orders" subtitle="Manage customer orders and fulfillment" />
      {data.error && <div role="alert" className="flex items-center gap-3 text-sm text-red-500">
        <p>{data.error}</p><Button variant="secondary" size="sm" onClick={data.refresh}>Retry</Button>
      </div>}

      <OrderList
        {...data}
        onView={handleView}
        onUpdateStatus={handleUpdateStatus}
        onCancel={handleCancel}
      />

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Order Details"
        size="xl"
      >
        {isDetailOpen && <OrderSummary orderId={selectedOrder?.id} />}
      </Modal>

      <Modal
        isOpen={isStatusOpen}
        onClose={() => { if (!pending.current) setIsStatusOpen(false); }}
        title="Update Order Status"
      >
        <OrderStatusForm
          statusOptions={data.changeStatusOptions}
          loading={data.filtersLoading}
          order={selectedOrder}
          onSubmit={handleSubmitStatus}
          onCancel={() => setIsStatusOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isCancelOpen}
        onClose={() => { if (!pending.current) setIsCancelOpen(false); }}
        loading={saving}
        onConfirm={handleConfirmCancel}
        title="Cancel Order"
        message={`Are you sure you want to cancel "${selectedOrder?.orderNo}"? This keeps the order history record.`}
      />
    </div>
  );
}

function Header({ title, subtitle, children }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#03152B]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
