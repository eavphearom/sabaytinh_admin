import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Box } from "lucide-react";
import Button from "../../../components/ui/Button";
import ImageUpload from "../../../components/ui/ImageUpload";
import Input from "../../../components/ui/Input";
import { categorySchema } from "../schemas/categorySchema";

const defaultValues = {
  name: "",
  description: "",
  image: null,
  is_active: true,
};

export default function CategoryForm({ category = null, onSubmit, pending = false, loading = false, error = null, onRetry }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const isActive = useWatch({ control, name: "is_active" });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name ?? "",
        description: category.description ?? "",
        image: category.image || null,
        is_active: category.is_active ?? true,
      });
    } else {
      reset(defaultValues);
    }
  }, [category, reset]);

  if (loading) {
    return <p role="status" className="py-6 text-center text-sm text-[#64748B]">Loading category details...</p>;
  }
  if (error) {
    return (
      <div role="alert" className="space-y-3 py-4 text-sm text-red-600">
        <p>{error.response?.data?.message || error.message || "Failed to load category."}</p>
        {onRetry && <button type="button" onClick={() => onRetry()} className="cursor-pointer underline">Retry</button>}
      </div>
    );
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <fieldset disabled={pending || isSubmitting} className="min-w-0 space-y-5">
      {/* First row: Information + Status */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Category information */}
        <div className="space-y-4 rounded-lg border border-[#D7DFEA] bg-white p-5 lg:col-span-2">
          <h3 className="font-semibold text-[#03152B]">General Information</h3>

          <Input
            label="Category Name"
            placeholder="Enter category name"
            error={errors.name?.message}
            {...register("name")}
          />

          <div>
            <label htmlFor="category-description" className="mb-1 block text-sm font-medium text-[#03152B]">Description</label>
            <textarea
              id="category-description"
              {...register("description")}
              placeholder="Enter description"
              rows={4}
              className="w-full rounded-lg border border-[#D7DFEA] p-3 text-sm outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
          </div>
        </div>

        {/* Category Status */}
        <div className="self-stretch overflow-hidden rounded-lg border border-[#D7DFEA] bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#D7DFEA] bg-[#F7FAFF] px-4 py-4">
            <Box size={20} className="text-[#03152B]" />
            <h3 className="text-base font-semibold text-[#03152B]">
              Category Status
            </h3>
          </div>

          {/* Radio options */}
          <div className="space-y-5 p-4">
            <label className="flex cursor-pointer items-start gap-4">
              <input
                type="radio"
                name="category-status"
                checked={isActive === true}
                onChange={() =>
                  setValue("is_active", true, {
                    shouldValidate: true,
                  })
                }
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#F97316]"
              />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base text-[#03152B]">Active</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                    Active
                  </span>
                </div>

                <p className="text-xs leading-6 text-[#64748B]">
                  Category will be visible on the website.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-4">
              <input
                type="radio"
                name="category-status"
                checked={isActive === false}
                onChange={() =>
                  setValue("is_active", false, {
                    shouldValidate: true,
                  })
                }
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#F97316]"
              />

              <div className="space-y-2">
                <span className="text-base text-[#03152B]">Inactive</span>

                <p className="text-xs leading-6 text-[#64748B]">
                  Category will be hidden from the website.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Second row: Category Image */}
      <div className="rounded-lg border border-[#D7DFEA] bg-white p-5">
        <ImageUpload
          label="Category Image"
          existingImage={category?.image ?? null}
          error={errors.image?.message}
          onChange={(file) => {
            setValue("image", file, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting || pending}>
          {category ? "Update Category" : "Save Category"}
        </Button>
      </div>
      </fieldset>
    </form>
  );
}
