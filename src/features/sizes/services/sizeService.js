import apiClient from "../../../services/apiClient";

function toPayload(values) {
  return {
    value: values.value,
    description: values.description?.trim() || "",
  };
}

const getAll = async (params = {}, signal) => {
  const response = await apiClient.get("/admin/sizes", {
    params,
    signal,
  });

  return response.data;
};

const getById = async (id) => {
  const response = await apiClient.get(
    `/admin/sizes/${encodeURIComponent(id)}`,
  );

  return response.data;
};

const create = async (values) => {
  const response = await apiClient.post("/admin/sizes", toPayload(values));

  return response.data;
};

const update = async (id, values) => {
  const response = await apiClient.put(
    `/admin/sizes/${encodeURIComponent(id)}`,
    toPayload(values),
  );

  return response.data;
};

const deleteSize = async (id) => {
  const response = await apiClient.delete(
    `/admin/sizes/${encodeURIComponent(id)}`,
  );

  return response.data;
};

export default {
  getAll,
  getById,
  create,
  update,
  deleteSize,
};
