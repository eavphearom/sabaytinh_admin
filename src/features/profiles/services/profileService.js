
import apiClient from "../../../services/apiClient";

// GET current user profile
const getProfile = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};

// UPDATE current user profile
const updateProfile = async (data) => {
  const formData = new FormData();

  formData.append("username", data.username.trim());
  formData.append("email", data.email.trim());
  formData.append("phone", data.phone.trim());

  if (data.profile instanceof File) {
    formData.append("profile", data.profile);
  }

  const response = await apiClient.put("/users/me", formData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data;
};

const profileService = {
  getProfile,
  updateProfile,
};

export default profileService;
