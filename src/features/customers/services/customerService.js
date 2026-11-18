
import apiClient from "../../../services/apiClient";

const getCustomers = async ({ page = 1, perPage = 10 } = {}) => {
  const response = await apiClient.get("/admin/customers", {
    params: {
      page_no: page,
      per_page: perPage,
    },
  });

  return response.data;
};

const customerService = {
  getCustomers,
};

export default customerService;
