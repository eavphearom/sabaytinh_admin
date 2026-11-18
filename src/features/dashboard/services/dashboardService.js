
import apiClient from "../../../services/apiClient";

const getDashboard = async () => {
  const response = await apiClient.get("/admin/dashboard/overview");
  return response.data;
};

const dashboardService = {
  getDashboard,
};

export default dashboardService;
