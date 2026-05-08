import api from "../../../lib/api";

export const register = async (username, email, password, confirmPassword) => {
  const response = await api.post("/api/auth/register", {
    username,
    email,
    password,
    confirmPassword
  });
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post("/api/auth/login", { username, password });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/api/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password, confirmPassword) => {
  const response = await api.post(`/api/auth/reset-password/${token}`, {
    password, confirmPassword
  });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/api/auth/get-me");
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/api/auth/logout");
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await api.post("/api/auth/resend-verification", { email });
  return response.data;
};
