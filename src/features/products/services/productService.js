import apiClient from "../../../services/apiClient";
import { productFormData } from "./productFormData";

const getAll = async (params, signal) => {
  // Search and pagination use local loading, not the full-page overlay.
  const response = await apiClient.get("/admin/products", {
    params,
    signal,
    skipGlobalLoading: true,
  });
  return response.data;
};

const getFilters = async (signal) => {
  // Fetch the category and brand IDs used by list and form dropdowns.
  const response = await apiClient.get("/admin/setting/filter/product", {
    signal,
    skipGlobalLoading: true,
  });
  return response.data;
};

const getStocks = async (id, signal) => {
  // TanStack Query can cancel this request when the stock modal closes.
  const response = await apiClient.get(
    "/admin/products/" + encodeURIComponent(id) + "/stocks",
    {
      signal,
      skipGlobalLoading: true,
    },
  );
  return response.data;
};

const create = async (values) => {
  // Convert nested variants, image files, and stock rows to multipart fields.
  const response = await apiClient.post(
    "/admin/products",
    productFormData(values),
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  // Some APIs report failure in the body even when the HTTP request succeeds.
  if (response.data.error)
    throw new Error(response.data.message || "Could not create product.");
  return response.data;
};

// Fetch editable product data, including existing variant/image/stock IDs.
const getById = async (id, signal) => {
  const response = await apiClient.get("/admin/products/" + encodeURIComponent(id), {
    signal, skipGlobalLoading: true,
  });
  if (response.data.error) throw new Error(response.data.message || "Could not load product.");
  return response.data;
};

// Existing nested IDs identify records; only new images are uploaded as files.
const update = async (id, values) => {
  const response = await apiClient.put("/admin/products/" + encodeURIComponent(id), productFormData(values, { update: true }), {
    headers: { "Content-Type": "multipart/form-data" },
    skipGlobalLoading: true,
  });
  if (response.data.error) throw new Error(response.data.message || "Could not update product.");
  return response.data;
};

// Delete only the confirmed product; keep loading inside the confirmation button.
const remove = async (id) => {
  const response = await apiClient.delete("/admin/products/" + encodeURIComponent(id), {
    skipGlobalLoading: true,
  });
  if (response.data?.error) throw new Error(response.data.message || "Could not delete product.");
  return response.data;
};

export default { getAll, getFilters, getStocks, getById, create, update, remove };
