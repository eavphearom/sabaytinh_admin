import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../../components/ui/Input";
import ImageUpload from "../../../components/ui/ImageUpload";
import Button from "../../../components/ui/Button";
import { deliverySchema } from "../schemas/deliverySchema";

// One form supports creation and editing; the page remounts it per selected record.
export default function DeliveryForm({ delivery, onSubmit, onCancel }) {
  const [logoRemoved, setLogoRemoved] = useState(false);
  const { register, handleSubmit, setValue, setError, clearErrors,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      name: delivery?.name ?? "",
      fee: delivery?.fee ?? "",
      estimated_min_days: delivery?.estimated_min_days ?? "",
      estimated_max_days: delivery?.estimated_max_days ?? "",
      logo: null,
    },
  });
  // The API only documents logo uploads, not removal of an existing logo.
  const handleLogo = (file) => {
    setLogoRemoved(!file && Boolean(delivery?.logo));
    setValue("logo", file, { shouldDirty: true, shouldValidate: true });
    if (!file && delivery?.logo) {
      setError("root.logo", { message: "Select a replacement logo to update the existing image." });
    } else clearErrors("root.logo");
  };
  // Require a replacement rather than pretending that omission deletes a saved logo.
  const submitValues = async (values) => {
    if (logoRemoved) {
      setError("root.logo", { message: "Select a replacement logo to update the existing image." });
      return;
    }
    await onSubmit(values);
  };
  return (
    <form onSubmit={handleSubmit(submitValues)} className="space-y-5">
      <fieldset disabled={isSubmitting} className="space-y-5">
        {/* Reuse the existing compact inputs and responsive form spacing. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" required error={errors.name?.message} {...register("name")} />
          <Input label="Fee" type="number" min="0" step="0.01" required
            error={errors.fee?.message} {...register("fee", { valueAsNumber: true })} />
          <Input label="Minimum Delivery Days" type="number" min="0" step="1" required
            error={errors.estimated_min_days?.message} {...register("estimated_min_days", { valueAsNumber: true })} />
          <Input label="Maximum Delivery Days" type="number" min="0" step="1" required
            error={errors.estimated_max_days?.message} {...register("estimated_max_days", { valueAsNumber: true })} />
        </div>
        <ImageUpload label="Delivery Logo" existingImage={delivery?.logo ?? null}
          onChange={handleLogo} error={errors.root?.logo?.message || errors.logo?.message} />
      </fieldset>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{delivery ? "Update Delivery" : "Save Delivery"}</Button>
      </div>
    </form>
  );
}
