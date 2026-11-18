import apiClient from "../../../services/apiClient";

function toFormData(values) {
  const data = new FormData();
  data.append("name", values.name.trim());
  data.append("description", values.description || "");
  // FormData stores boolean values as strings, including false.
  data.append("is_active", String(values.is_active));
  // Existing image URLs are not uploads; only send a newly selected file.
  if (values.image instanceof File) data.append("image", values.image);
  else if (values.image === null) data.append("image", "");
  return data;
}

const getAll = async (params, signal) => {
  const response = await apiClient.get("/admin/categories", { params, signal, skipGlobalLoading: true });
  return response.data;
};

const getById = async (id, signal) => {
  const response = await apiClient.get("/admin/categories/" + encodeURIComponent(id), { signal, skipGlobalLoading: true });
  return response.data;
};

const create = async (values) => {
  const response = await apiClient.post("/admin/categories", toFormData(values), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const update = async ({ id, values }) => {
  const response = await apiClient.put("/admin/categories/" + encodeURIComponent(id), toFormData(values), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const remove = async (id) => {
  const response = await apiClient.delete("/admin/categories/" + encodeURIComponent(id));
  return response.data;
};

export default { getAll, getById, create, update, remove };
