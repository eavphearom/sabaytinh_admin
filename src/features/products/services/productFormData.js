// Indexed field names must match the backend's nested multipart binding.
export function productFormData(values, { update = false } = {}) {
  const data = new FormData();
  data.append("category_id", values.category);
  data.append("brand_id", values.brand);
  data.append("name", values.name.trim());
  data.append("description", values.description || "");
  data.append("is_active", String(values.status === "Active"));
  // unit_id is read-only response data; the write API does not need it.
  values.variants.forEach((variant, i) => {
    const prefix = "variants[" + i + "]";
    // Preserve IDs on update so existing records are not recreated.
    if (update && variant.id != null) data.append(prefix + ".id", String(variant.id));
    if (update && variant.is_active != null) data.append(prefix + ".is_active", String(variant.is_active));
    data.append(prefix + ".color_id", variant.color);
    data.append(prefix + ".cost", String(variant.cost));
    data.append(prefix + ".price", String(variant.price));
    data.append(prefix + ".is_default", String(variant.is_default));
    variant.images.forEach((image, j) => {
      // Upload the File itself, never its temporary preview URL.
      if (update && image.id != null) data.append(prefix + ".images[" + j + "].id", String(image.id));
      if (image.file instanceof File) {
        data.append(prefix + ".images[" + j + "].image", image.file);
      } else if (!update || image.id == null) {
        throw new Error("Select a file for each variant image.");
      }
      data.append(prefix + ".images[" + j + "].is_primary", String(image.is_primary));
    });
    variant.stocks.forEach((stock, j) => {
      const key = prefix + ".stocks[" + j + "]";
      if (update && stock.id != null) data.append(key + ".id", String(stock.id));
      data.append(key + ".size_id", stock.size);
      data.append(key + ".qty", String(stock.stock));
      data.append(key + ".low_stock_alert", String(stock.lowStock));
    });
  });
  return data;
}
