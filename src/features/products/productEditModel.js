// Resolve stored image paths against the API host; keep absolute URLs unchanged.
export function productImageUrl(path, apiBaseUrl, origin) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = new URL(apiBaseUrl || "/", origin);
  return new URL(path.startsWith("/") ? path : "/uploads/images/" + path, base).href;
}

// Translate API fields to form fields without losing nested record IDs.
export function productEditValues(data, apiBaseUrl, origin) {
  if (!data || !Array.isArray(data.variants)) throw new Error("Unexpected product detail response.");
  return {
    ...data,
    category: String(data.category_id ?? ""),
    brand: String(data.brand_id ?? ""),
    status: data.is_active ? "Active" : "Inactive",
    description: data.description || "",
    variants: data.variants.map(variant => ({
      ...variant,
      code: variant.sku_prefix || "",
      color: String(variant.color_id ?? ""),
      images: (variant.images || []).map(image => ({
        ...image,
        url: productImageUrl(image.image, apiBaseUrl, origin),
      })),
      stocks: (variant.stocks || []).map(stock => ({
        ...stock,
        size: String(stock.size_id ?? ""),
        stock: stock.qty,
        lowStock: stock.low_stock_alert,
      })),
    })),
  };
}

// Removal semantics are not documented yet; prevent unintended server deletions.
export function assertNoRemovedProductRecords(original, values) {
  for (const variant of original.variants) {
    const current = values.variants.find(item => item.id === variant.id);
    if (!current) throw new Error("Removing existing variants requires the API deletion contract.");
    for (const field of ["images", "stocks"]) {
      if (variant[field].some(item => !current[field].some(next => next.id === item.id))) {
        throw new Error("Removing existing images or sizes requires the API deletion contract.");
      }
    }
  }
}
