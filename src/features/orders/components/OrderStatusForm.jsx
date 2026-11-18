import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Input from "../../../components/ui/Input";

const statusSchema = z.object({
  status: z.string().min(1, "Order status is required"),
  note: z.string().trim(),
});

export default function OrderStatusForm({ order, onSubmit, onCancel, statusOptions = [], loading = false }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: "",
      note: "",
    },
  });

  useEffect(() => {
    // Match the response label to its real API value, without inventing a fallback.
    const current = String(order?.order_status ?? order?.status ?? "").toLowerCase();
    const selected = statusOptions.find((option) =>
      option.value.toLowerCase() === current || option.label.toLowerCase() === current);
    reset({
      status: selected?.value ?? "",
      note: "",
    });
  }, [order, reset, statusOptions]);

  // Only submit values supplied by the settings endpoint.
  const submitStatus = async (values) => {
    if (!statusOptions.some((option) => option.value === values.status)) {
      setError("status", { message: "Select a valid order status" });
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(submitStatus)} className="space-y-5">
      <div className="rounded-lg border border-[#D7DFEA] bg-[#F8FAFD] p-4">
        <p className="text-sm font-semibold text-[#03152B]">
          #{order?.orderNo}
        </p>
        <p className="mt-1 text-sm text-[#64748B]">
          Update fulfillment status for {order?.customer}.
        </p>
      </div>

      <Select
        label="Order Status"
        options={statusOptions}
        placeholder="Select status"
        error={errors.status?.message}
        {...register("status")}
      />
      {/* The status endpoint accepts a note along with the new order status. */}
      <Input label="Note" placeholder="Preparing the order" {...register("note")} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={loading || !statusOptions.length}>
          Update Status
        </Button>
      </div>
    </form>
  );
}
