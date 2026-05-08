import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, getMe, logout } from "../services/auth.api";
import { useNavigate } from "react-router";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading, isAppLoading, authError, setAuthError } = context;

  const handleLogin = async (username, password) => {
    setLoading(true);
    setAuthError("");
    try {
      const response = await login(username, password);
      const userData = response.data?.user || response.user || response.data;
      setUser(userData);
      return response;
    } catch (err) {
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.data?.message || 
        err?.message || 
        "Login failed. Please try again.";
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (username, email, password, confirmPassword) => {
    setLoading(true);
    setAuthError("");
    try {
      const response = await register(username, email, password, confirmPassword);
      return response;
    } catch (err) {
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.data?.message || 
        err?.message || 
        "Registration failed.";
      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGetMe = async () => {
    try {
      const response = await getMe();
      setUser(response.data || response.user);
    } catch (err) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    setUser(null);
    // Use SPA navigation instead of full page reload
    window.location.href = "/login";
  };

  return {
    user,
    loading,
    isAppLoading,
    authError,
    setAuthError,
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
  };
};
