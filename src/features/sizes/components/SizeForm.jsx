import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../components/ui/Button";
import { sizeSchema } from "../schemas/sizeSchema";
import Input from "../../../components/ui/Input";

export default function SizeForm({
  size = null,
  onSubmit,
  pending = false,
  loading = false,
  error = null,
  onRetry,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      value: "",
      description: "",
    },
  });

  useEffect(() => {
    if (size) {
      reset({
        value: size.value == null ? "" : Number(size.value),
        description: size.description || "",
      });
    } else {
      reset({
        value: "",
        description: "",
      });
    }
  }, [size, reset]);

  if (loading) {
    return (
      <p role="status" className="py-6 text-center text-sm text-[#64748B]">
        Loading size details...
      </p>
    );
  }

  if (error) {
    return (
      <div role="alert" className="space-y-3 py-4 text-sm text-red-600">
        <p>
          {error.response?.data?.message ||
            error.message ||
            "Failed to load size."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={() => onRetry()}
            className="cursor-pointer underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <fieldset
        disabled={isSubmitting || pending}
        className="min-w-0 space-y-4"
      >
        <Input
          label="Size"
          type="number"
          step={1}
          required
          placeholder="eg. 40"
          error={errors.value?.message}
          {...register("value", { valueAsNumber: true })}
        />

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#03152B]">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter description"
            className="w-full rounded-lg border border-[#D7DFEA] bg-white p-3 text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
            rows={4}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting || pending}>
            Save Size
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
