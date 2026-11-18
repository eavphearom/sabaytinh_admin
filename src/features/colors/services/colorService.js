import apiClient from "../../../services/apiClient";

function toPayload(values) {
  return {
    name: values.name.trim(),
    hex_code: values.colorCode,
  };
}

const getAll = async (params, signal) => {
  const response = await apiClient.get("/admin/colors", {
    params,
    signal,
    skipGlobalLoading: true,
  });
  return response.data;
};

const getById = async (id, signal) => {
  const response = await apiClient.get("/admin/colors/" + encodeURIComponent(id), {
    signal,
    skipGlobalLoading: true,
  });
  return response.data;
};

const create = async (values) => {
  const response = await apiClient.post("/admin/colors", toPayload(values));
  return response.data;
};

const update = async ({ id, values }) => {
  const response = await apiClient.put("/admin/colors/" + encodeURIComponent(id), toPayload(values));
  return response.data;
};

const remove = async (id) => {
  const response = await apiClient.delete("/admin/colors/" + encodeURIComponent(id));
  return response.data;
};

export default { getAll, getById, create, update, remove };
