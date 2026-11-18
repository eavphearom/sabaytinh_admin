import apiClient from "../../../services/apiClient";

const endpoint = "/admin/delivery-methods";
const config = { skipGlobalLoading: true };
const multipart = { ...config, headers: { "Content-Type": "multipart/form-data" } };

// Also surface validation errors returned with HTTP 200.
const unwrap = (response) => {
  if (response.data?.error) throw new Error(response.data.message || "Delivery request failed.");
  return response.data;
};
// Search and paginate without a global loading overlay.
const getAll = async (params, signal) =>
  unwrap(await apiClient.get(endpoint, { ...config, params, signal }));
// Load fresh details before editing.
const getById = async (id, signal) =>
  unwrap(await apiClient.get(`${endpoint}/${id}`, { ...config, signal }));
// Create with a multipart logo upload.
const create = async (data) => unwrap(await apiClient.post(endpoint, data, multipart));
// Update follows the Banner PUT convention.
const update = async (id, data) => unwrap(await apiClient.put(`${endpoint}/${id}`, data, multipart));
// Delete only after confirmation.
const remove = async (id) => unwrap(await apiClient.delete(`${endpoint}/${id}`, config));

// Omit unchanged logos rather than sending their existing URL as a file.
export const toDeliveryFormData = (values) => {
  const data = new FormData();
  for (const field of ["name", "fee", "estimated_min_days", "estimated_max_days"]) {
    data.append(field, String(values[field]));
  }
  if (values.logo instanceof File) data.append("logo", values.logo);
  return data;
};
export default { getAll, getById, create, update, remove };
