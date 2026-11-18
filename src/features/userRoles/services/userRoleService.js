
import apiClient from "../../../services/apiClient";

const getUsers = async ({ page = 1, perPage = 10 } = {}) => {
  const response = await apiClient.get("/admin/users", {
    params: {
      page_no: page,
      per_page: perPage,
    },
  });

  return response.data;
};

const userRoleService = {
  getUsers,
};

export default userRoleService;
