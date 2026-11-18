import apiClient from "../../../services/apiClient";

function toFormData(values) {
  const data = new FormData();
  data.append("name", values.name.trim());
  data.append("description", values.description || "");
  data.append("is_active", "true");
  // Existing logo URLs are not uploads; only send a newly selected file.
  if (values.logo instanceof File) data.append("logo", values.logo);
  else if (values.logo === null) data.append("logo", "");
  return data;
}

const getAll = async (params, signal) => {
  const response = await apiClient.get("/admin/brands", { params, signal, skipGlobalLoading: true });
  return response.data;
};

const getById = async (id, signal) => {
  const response = await apiClient.get("/admin/brands/" + encodeURIComponent(id), { signal, skipGlobalLoading: true });
  return response.data;
};

const create = async (values) => {
  const response = await apiClient.post("/admin/brands", toFormData(values), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const update = async ({ id, values }) => {
  const response = await apiClient.put("/admin/brands/" + encodeURIComponent(id), toFormData(values), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const remove = async (id) => {
  const response = await apiClient.delete("/admin/brands/" + encodeURIComponent(id));
  return response.data;
};

export default { getAll, getById, create, update, remove };
