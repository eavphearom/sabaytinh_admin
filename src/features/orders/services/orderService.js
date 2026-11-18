import apiClient from "../../../services/apiClient";

const endpoint = "/admin/orders";
const config = { skipGlobalLoading: true };

// Treat application-level errors as failures, even with an HTTP 200 response.
const unwrap = (response) => {
  if (response.data?.error)
    throw new Error(response.data.message || "Order request failed.");
  return response.data;
};
// Filters use their API values; pagination and search stay server-side.
const getAll = async (params, signal) =>
  unwrap(await apiClient.get(endpoint, { ...config, params, signal }));
const getById = async (id, signal) =>
  unwrap(await apiClient.get(`${endpoint}/${encodeURIComponent(id)}`, { ...config, signal }));
// Share backend-provided choices between table filters and the status form.
const getFilters = async (signal) =>
  unwrap(
    await apiClient.get("/admin/setting/filter/order", { ...config, signal }),
  );
// Send JSON status and note; payment status is controlled by the backend.
const updateStatus = async (id, values) =>
  unwrap(
    await apiClient.patch(
      `${endpoint}/${id}/status`,
      {
        order_status: values.status,
        note: values.note ?? "",
      },
      config,
    ),
  );
// Cancellation is a separate action, not deletion or an automatic refund.
const cancel = async (id) =>
  unwrap(await apiClient.patch(`${endpoint}/${id}/cancel`, undefined, config));

export default { getAll, getById, getFilters, updateStatus, cancel };
