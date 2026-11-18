import apiClient from "../../../services/apiClient";

const getAll = async (params = {}, signal) => {
  const response = await apiClient.get("/admin/banners", {
    params,
    signal,
    // skipGlobalLoading: true,
  });

  return response.data;
};

const create = async (formData) => {
  const response = await apiClient.post("/admin/banners", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const getById = async (id) => {
  const response = await apiClient.get(`/admin/banners/${id}`);
  return response.data;
};

const update = async (id, formData) => {
  const response = await apiClient.put(`/admin/banners/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
const deleteBanner = async (id) => {
  const response = await apiClient.delete(`/admin/banners/${id}`);
  return response.data;
};

export default { getAll, create, getById, update, deleteBanner };
