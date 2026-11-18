import apiClient from "../../../services/apiClient";

// Fetch one page; background searches do not trigger the global loader.
const getAll = async (params, signal) => {
  const response = await apiClient.get("/admin/stock-movements", {
    params,
    signal,
    skipGlobalLoading: true,
  });
  if (response.data?.error) throw new Error(response.data.message);
  return response.data;
};

// Load type options from settings, not from the current page of movements.
const getFilters = async (signal) => {
  const response = await apiClient.get("/admin/setting/filter/stock-movement", {
    signal,
    skipGlobalLoading: true,
  });
  if (response.data?.error) throw new Error(response.data.message);
  return response.data;
};

export default { getAll, getFilters };
