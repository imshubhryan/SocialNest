import { createContext, useState, useEffect } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // For login/register buttons
  const [isAppLoading, setIsAppLoading] = useState(true); // For initial page load
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getMe();
        setUser(response.data || response.user);
      } catch (err) {
        setUser(null);
      } finally {
        setIsAppLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, setLoading, isAppLoading, authError, setAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
